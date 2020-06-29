pragma solidity ^0.5.12;

import './DateTime.sol';
import './SignedSafeMath.sol';

//----------------------------------------------------------------------------
// CXC Sukuk Smart Contract - signed integer
//----------------------------------------------------------------------------

contract CXCSukuk is DateTime {
    using SignedSafeMath for int256;
    address public owner;
    uint256 public NumberOfCoupons;
    uint256 public tenor = 10;
    string public paymentFrequency = 'Semi-Annual';
    string public profitRate;
    uint256 public principal;

    address public SPVAddr;
    address public investorAddr;

    // Data strucure
    struct Coupon{
        uint256 id;
        uint timestamp;
        int256 capital;
        int256 reumn;
        int256 rembCapital;
        string status;
        string TxId;
        int256 value;
    }

    mapping(uint256 => Coupon) public coupons;

    // Event of scheduled coupon
    event ScheduleCouponEvent(uint256 id,uint256 timestamp, string status, bytes32 couponHash);

    // Event of updating of a scheduled coupon
    event UpdateCouponEvent(uint256 id, string status, int256 value);

    constructor (string memory _profitRate, uint256 _principal, address _SPVAddr, address _investorAddr ) public {
        require(bytes(_profitRate).length > 0, 'Error101: Profit rate is required');
        require(_principal != 0, 'Error102: Prinical value is required');
        require(_investorAddr != address(0x0), 'Error103: Investor address is required');
        require(_SPVAddr != address(0x0), 'Error104: Obligor address is required');
        owner = msg.sender;
        profitRate = _profitRate;
        principal = _principal;
        investorAddr = _investorAddr;
        SPVAddr = _SPVAddr;
        NumberOfCoupons = 0;
    }

    //Schedule coupon
    function ScheduleCoupon(uint256 _timestamp, int256 _capital, int256 _reumn, int256 _rembCapital ) public returns (uint256){

        require(_timestamp > 1588001180, 'Error105: Timestamp should be grater than 27, April 2020'); //1588001180=Monday,April27,202011:54:25PM
        require(_capital > 0, 'Error106: Capital grater than zero is required');
        require(_reumn > 0, 'Error107: Reumn grater than zero is required');
        require(_rembCapital > 0, 'Error108: Remb Capital grater than zero is required');

        NumberOfCoupons = NumberOfCoupons+1;
        Coupon memory _coupon;
        _coupon.id = NumberOfCoupons;
        _coupon.timestamp = _timestamp;
        _coupon.capital = _capital;
        _coupon.reumn = _reumn;
        _coupon.rembCapital = _rembCapital;
        _coupon.status = "Pending";
        _coupon.TxId = "";
        _coupon.value = 0;

        bytes32 couponHash = keccak256(abi.encodePacked (_timestamp, _capital, _reumn, _rembCapital));
        coupons[NumberOfCoupons] = _coupon;
        emit ScheduleCouponEvent(NumberOfCoupons, _timestamp, "Pending", couponHash);
        return NumberOfCoupons;
    }

   //Update coupon status
   function UpdateCoupon(uint256 _id, string memory _status, string memory _TxId, int256 _value) public returns (bool)
   {
      require(_id > 0, 'Error118: Invalid Id value');
      require(coupons[_id].id > 0, 'Error109: Coupon does not Exist');
      require(_id > 0, 'Error110: None Zero value is required for Id');
      require(bytes(_status).length > 0, 'Error111: Status is required');
      require(bytes(_TxId).length > 0, 'Error112: Transaction Id is required');
      require(_value >= 0, 'Error113: Coupon value should greter than or equal to zero');
        coupons[_id].status = _status;
        coupons[_id].TxId = _TxId;
        coupons[_id].value = _value;

        emit UpdateCouponEvent(_id, _status, _value);
        return true;
   }

    // Get total coupons value per year
    function TotalCouponsPerYear(uint256 _year) public returns(int256)
    {
       require(_year>=2020 && _year < 2030, 'Error114: Invalid value of year');
        // Invoce Datatime smart contract
        DateTime date = new DateTime();
        int256 totalCoupons = 0;
        uint256 year;
        
        for(uint256 i = 0; i < NumberOfCoupons; i++)
        {
            uint256 temp = coupons[i].timestamp;
            year = date.getYear(temp);
            if(_year==year)
            {
                totalCoupons = totalCoupons.add(coupons[i].value);
            }
        }
        return totalCoupons;
    }

    function GetCouponValue(uint256 id) view public returns(int256)
    {
        return coupons[id].value;
    }


    function GetNextCouponId() view public returns(uint256)
    {
        uint256 nextCoupon = 0;

        for(uint256 i = 1; i <= NumberOfCoupons; i++)
        {
           if (keccak256(bytes(coupons[i].status)) == keccak256(bytes("Pending"))) //get the first occurance of Pending
           {
               nextCoupon = i;
               break;
           }
        }
        return nextCoupon;
    }

}