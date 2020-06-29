pragma solidity ^0.5.12;

import './DateTime.sol';
import './SignedSafeMath.sol';

//----------------------------------------------------------------------------
// CXC Murabaha Smart Contract - Signed integer
//----------------------------------------------------------------------------

contract CXCMurabaha is DateTime {
    using SignedSafeMath for int256;
    address public owner;
    uint256 public NumberOfInstallments;
    uint256 public tenor = 10;
    string public paymentFrequency = 'monthly';
    string public profitRate;
    uint256 public principal;

    address public SPVAddr;
    address public obligorAddr;

    // MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == owner, "Only Owner");
        _;
    }

    // Data strucure
     struct Payment{
        uint256 id;
        uint256 timestamp;
        string paymentType; //SEPA, Bank Wire, Cash, Other
        string TxId;
        int256 value;
        uint256 status; //0: success, 1:Fail, 2: Cancelled
    }

    // Status Code
    // Pending, Success, Remediated,Failed, Partial
    struct Installment{
        uint256 id;
        uint timestamp;
        int256 capital; //outstanding
        int256 reumn; // profit
        int256 rembCapital; //principal payment
        string overallstatus;
        uint256 paymentsLength;
        int256 totalCollected;
        mapping(uint256 => Payment) Payments;
    }

    mapping(uint256 => Installment) public installments;

    // Event for scheduled installment
    event ScheduleInstallmentEvent(uint256 id,uint256 timestamp ,string status, bytes32 installmentHash);

    // Event for updating of a scheduled installment
    event UpdateInstallmentEvent(uint256 id, string status, int256 value);

    // Constructor
    constructor (string memory _profitRate, uint256 _principal, address _SPVAddr, address _obligorAddr ) public {
        
        require(bytes(_profitRate).length > 0, 'Error101: Profit rate is required');
        require(_principal != 0, 'Error102: Prinical value is required');
        require(_SPVAddr != address(0x0), 'Error116: SPV address is required');
        require(_obligorAddr != address(0x0), 'Error117: Obligor address is required');
        
        owner = msg.sender;
        profitRate = _profitRate;
        principal = _principal;
        SPVAddr = _SPVAddr;
        obligorAddr = _obligorAddr;
        NumberOfInstallments = 0;
    }

    //Schedule installment
    function ScheduleInstallment(uint256 _timestamp, int256 _capital, int256 _reumn, int256 _rembCapital ) public
                                onlyOwner returns (uint256){

        require(_timestamp > 1588001180, 'Error105: Timestamp should be grater than 27, April 2020'); //1588001180 = Monday, April 27, 2020 11:54:25 PM
        require(_capital > 0, 'Error106: Capital grater than zero is required');
        require(_reumn > 0, 'Error107: Reumn grater than zero is required');
        require(_rembCapital > 0, 'Error108: Remb Capital grater than zero is required');

            NumberOfInstallments = NumberOfInstallments+1;
            Installment memory _installment;
            _installment.id = NumberOfInstallments;
            _installment.timestamp = _timestamp;
            _installment.capital = _capital;
            _installment.reumn = _reumn;
            _installment.rembCapital = _rembCapital;
            _installment.overallstatus = "Pending";
 
            bytes32 installmentHash = keccak256(abi.encodePacked (_timestamp, _capital, _reumn, _rembCapital));
            installments[NumberOfInstallments] = _installment;
            emit ScheduleInstallmentEvent(NumberOfInstallments,_timestamp, "Pending", installmentHash);
            return NumberOfInstallments;
    }

   //Update installment status
   function UpdateInstallment(uint256 _id, uint256 _status, string memory _TxId, int256 _value, string memory _paymentType) public
                            onlyOwner returns (bool)
   {
      require(_id > 0, 'Error118: Invalid Installment Id');
      require(installments[_id].id > 0, 'Error119: Installment does not Exist');
      require(_status >= 0, 'Error111: Status is required');
      require(bytes(_TxId).length > 0, 'Error112: transaction Id is required');
      //require(_value >= 0, 'Error120: Collected amount should greter than or equal to zero');
      
      Payment memory _temp;
      uint256 _paymentLenth = installments[_id].paymentsLength;
      _temp.id = _paymentLenth+1;
      _temp.value = _value;
      _temp.status = _status;
      _temp.timestamp = block.timestamp;
      _temp.TxId = _TxId;
      _temp.paymentType = _paymentType;
      
      installments[_id].Payments[_paymentLenth+1] = _temp;
      installments[_id].paymentsLength = _paymentLenth+1;
      
      string memory _overallStatus = OverAllStatus(_id);
      installments[_id].overallstatus = _overallStatus;
      installments[_id].totalCollected = GetPaymentsTotal(_id);
      
      emit UpdateInstallmentEvent(_id, _overallStatus, GetPaymentsTotal(_id));
      
      return true;
   }

//    function UpdatePayment(uint256 _installmentId, uint256 _paymentId, string memory _TxId, int256 _value, uint256 _status) public {
//        installments[_installmentId].Payments[_paymentId].value = _value;
//        installments[_installmentId].Payments[_paymentId].TxId = _TxId;
//        installments[_installmentId].Payments[_paymentId].status = _status;
//        string memory _overallStatus = OverAllStatus(_installmentId);
//        installments[_installmentId].overallstatus = _overallStatus;
//        installments[_installmentId].totalCollected = GetPaymentsTotal(_installmentId);
//        emit UpdateInstallmentEvent(_installmentId, _overallStatus, GetPaymentsTotal(_installmentId));

//    }

    // Overall status calculation
    function OverAllStatus(uint256 _id) internal view returns(string memory)
    {
        require(_id > 0,"Invalid installment Id");
        
        uint256 length = installments[_id].paymentsLength;
        int256 sucessPayments = 0;
        int256 failedPayments = 0;
        int256 totalPayments = 0;
        int256 refundedPayment = 0;
        int256 monthlyPayment = installments[_id].reumn.add(installments[_id].rembCapital);
        
        for(uint256 i = 1; i <= length; i++)
        {
            if(installments[_id].Payments[i].status == 0)
            sucessPayments = sucessPayments+1;
            else if (installments[_id].Payments[i].status == 1)
            {
                failedPayments = failedPayments+1;
            }
            else if (installments[_id].Payments[i].status == 2)
            {
                refundedPayment = refundedPayment+1;
            }
            
            totalPayments = totalPayments.add(installments[_id].Payments[i].value);

        }
        
        if(totalPayments==0 && length==0)
            return "Pending";
        else if(sucessPayments==1 && failedPayments==0 && refundedPayment==0 && totalPayments>=monthlyPayment)
            return "Success";
        else if (sucessPayments>=1 && length>1 && totalPayments>=monthlyPayment)
            return "Remediated";
        else if(totalPayments > 0 && totalPayments < monthlyPayment)
            return "Partial";
        else if(failedPayments >= 1 && totalPayments==0)
            return "Failed";
        else if(refundedPayment>=1 && totalPayments==0)
            return "Refunded";
    }
    
    function GetPayments(uint256 _installmentId, uint256 _index) view public returns (uint256,uint256,int256,uint256,string memory, string memory)
    {
        require(_installmentId>0, "Invalid installments Id");
        require(_index <= installments[_installmentId].paymentsLength, "Invalid subPayments index");
        return (installments[_installmentId].Payments[_index].id,
                installments[_installmentId].Payments[_index].timestamp,
                installments[_installmentId].Payments[_index].value,
                installments[_installmentId].Payments[_index].status,
                installments[_installmentId].Payments[_index].TxId,
                installments[_installmentId].Payments[_index].paymentType
                );
    }
    
    function GetPaymentsTotal(uint256 _installmentId) view public returns (int256)
    {
        uint256 length = installments[_installmentId].paymentsLength;
        int256 totalPayments = 0;

        for(uint256 i = 1; i <= length; i++)
        {
            totalPayments = totalPayments.add(installments[_installmentId].Payments[i].value);
        }
        return totalPayments;
    }

    function GetCouponValue(uint256 couponId) view public returns (int256)
    {
        uint256 from = (couponId*6) - 5;
        uint256 to = (couponId*6);
        int256 couponValue = 0;

        for(uint256 i = from; i<=to; i++)
        {
            couponValue = couponValue + GetPaymentsTotal(i);
        }

        return couponValue;
    }

    function GetNextInstallment() view public returns(uint256, int256, int256)
    {
        uint256 nextInstallment = 0;

        for(uint256 i = 1; i <= NumberOfInstallments; i++)
        {
           if (keccak256(bytes(installments[i].overallstatus)) == keccak256(bytes("Pending"))) //get the first occurance of pendding
           {nextInstallment = i;
           break;
           }
        }
        return (installments[nextInstallment].id,installments[nextInstallment].reumn, installments[nextInstallment].rembCapital);
    }
}