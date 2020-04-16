pragma solidity ^0.5.16;
//pragma solidity ^0.6.4;

import "./safemath.sol";
import "./context.sol";
import "./datetime.sol";
//import "./usd.sol";

contract ERC20Interface {
    uint256 constant public decimals = 18;
    /// total amount of tokens
    function totalSupply() public view returns(uint256 supply);

    /// @param _owner The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _owner) public view returns (uint256 balance);

    /// @notice send `_value` token to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) public returns (bool success);

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);

    /// @notice `msg.sender` approves `_spender` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of tokens to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value) public returns (bool success);

    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);

    // EVENTS
    
    // solhint-disable-next-line no-simple-event-func-name
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract Ownable {
    address public owner;
    address public newOwner;

    // MODIFIERS

    /// @dev Throws if called by any account other than the owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Only Owner");
        _;
    }

    /// @dev Throws if called by any account other than the new owner.
    modifier onlyNewOwner() {
        require(msg.sender == newOwner, "Only New Owner");
        _;
    }

    modifier notNull(address _address) {
        require(_address != address(0),"address is Null");
        _;
    }

    // CONSTRUCTORS

    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    constructor() public {
        owner = msg.sender;
    }

    /// @dev Allows the current owner to transfer control of the contract to a newOwner.
    /// @param _newOwner The address to transfer ownership to.
    
    function transferOwnership(address _newOwner) public notNull(_newOwner) onlyOwner {
        newOwner = _newOwner;
    }

    /// @dev Allow the new owner to claim ownership and so proving that the newOwner is valid.
    function acceptOwnership() public onlyNewOwner {
        address oldOwner = owner;
        owner = newOwner;
        newOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }

    // EVENTS
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
}


contract Murabaha is Context, ERC20Interface, Ownable, DateTime {
    using SafeMath for uint256;

    mapping (address => uint256) public _balances;

    mapping (address => mapping (address => uint256)) public _allowances;


    uint256 private _totalSupply;
    string constant public name = "Mortgage Pool";
    string constant public symbol = "XMRB";
    uint256 constant public decimals = 18;
    string constant public version = "0.0.1";


    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20};
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for `sender`'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }

    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements
     *
     * - `to` cannot be the zero address.
     */
    /*
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }
    */

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    /*
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }
    */

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.
     *
     * This is internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`.`amount` is then deducted
     * from the caller's allowance.
     *
     * See {_burn} and {_approve}.
     */
    /*
    function _burnFrom(address account, uint256 amount) internal {
        _burn(account, amount);
        _approve(account, _msgSender(), _allowances[account][_msgSender()].sub(amount, "ERC20: burn amount exceeds allowance"));
    }
    */

    //---------------------------------------------------------------------------
    // MORTGAGE SPECIFIC FUNCTIONS
    uint gPeriodsPerYear = 12;

    uint public gYearPayFirst; // example: 2020
    uint public gPeriodPayFirst; // starts with 1,  <= gPeriodsPerYear
    uint public gYearPayLast;
    uint public gPeriodPayLast;  //starts with 1,  <= gPeriodsPerYear

    address gAddrSpv;

    int public gMonthlyPaymentValue;	// fixed monthly payment value (!) in cents (!)
    uint public gMonthsToPay;		// number of months to pay

    // errCode = 1 -- gYearPayFirst, gPeriodPayFirst are not inited
    function getFinalYearPeriod() public view returns(uint finalYear, uint finalPeriod, uint errCode) {
        if( gYearPayFirst == 0 || gPeriodPayFirst == 0 ) {
            return (0, 0, 1);
        }

        finalYear = gYearPayFirst + gMonthsToPay.div(gPeriodsPerYear);
        finalPeriod = gPeriodPayFirst + gMonthsToPay.mod(gPeriodsPerYear);

        if( finalPeriod > gPeriodsPerYear ) {
            finalYear = finalYear + 1;
            finalPeriod = finalPeriod - gPeriodsPerYear;
        }
        return (finalYear, finalPeriod, 0);

    }


    constructor(int _monthlyPaymentValue, uint _monthsToPay, uint _yearPayFirst,
             uint _periodPayFirst, address _addrSpv) public {
        gMonthlyPaymentValue = _monthlyPaymentValue;
        gMonthsToPay = _monthsToPay;
        gYearPayFirst = _yearPayFirst;
        gPeriodPayFirst = _periodPayFirst;
        gAddrSpv = _addrSpv;

        _totalSupply = 100 * 10**uint(decimals);
        _balances[ gAddrSpv ] = _totalSupply;
        emit Transfer(address(0), gAddrSpv, _totalSupply);
    }

    struct Payment{
        uint mongoId;
        int signDebitCredit; // 0 = pending or error; 1 = success in homeowner payment; -1 = success in SPV transfer
        uint errorCode; // 0 - success, 1 - error with MongoPay
        uint day; // number of the payment day in the period starting from 1 (day of the month)
        int value; // in cents
        bool deleted;
    }
    struct PaymentArr{ //this is array of payments during the given period (a month)
        uint dateLast;
        Payment[] payments;
        //this params below are not needed, as they are keys in gPayment mapping
        //uint year;   // example 2019
        //uint period; //starts with 1,  <= gPeriodsPerYear
    }

    mapping(uint /* YEAR*10^2 + PeriodNum starting from 1 (Usually number of the month) */
            => PaymentArr) public gPayments;
    /*
    struct Mortgage{
        string name;
        string owner;
        string desc;
	uint periodsPerYear = 12; // always 12
        bool suspended;
        uint yearPayFirst;
        uint monthPayFirst;
	address accumAccount; // accounts where the payments accumulate and then transfered to SPV
    }
    Mortgage[] public gMortgages;
    */

    /**
        _year -- example: 2019
        _period -- starts with 1,  <= gPeriodsPerYear
     */
    function getPeriodInd(uint _year, uint _period) public pure returns(uint res) {
        res = (_year*100 + _period);
        return res;
    }

    /**
        errCode:
            1 = name is empty
            2 = cwner is empty
     */
     /*
    event evMortgageAdded(uint _newInd, uint _errCode);
    function addMortgage(string memory _name, string memory _owner, string memory _desc, address _accumAccount) public onlyOwner {
        Mortgage memory _mortg;
        _mortg.name = _name;
        _mortg.owner = _owner;
        _mortg.desc = _desc;
        _mortg.periodsPerYear = 12; // monthly payments bz default
        _mortg.accumAccount = _accumAccount; 
        gMortgages.push(_mortg);
        emit evMortgageAdded(gMortgages.length, 0);
    }
    function getMortgageLen() public view returns(uint _len) {
        return gMortgages.length;
    }*/

    /**
        errCode:
            1 = _indMortg is not in the range of the gMortgages indexes
            2 = _year should be greater tham 2000
            3 = _period should be less tham mortgage's periodPerYear
            4 = _period should not be zero == period number starts from 1 like months
            5 = gYearPayFirst, gPeriodPayFirst are not initialized
            6 = _year, _period are less then gYearPayFirst, gPeriodPayFirst
     */
    event evPaymentAdded(uint indexed _year, uint indexed _period, uint indexed _day,
                 uint _newInd, int _value, int _signDebitCredit, uint _errCode);
    function addPayment(uint _year, uint _period, uint _day, int _value, int _signDebitCredit) public onlyOwner {
        if( _year < 2000 ) {
            emit evPaymentAdded(_year, _period, _day, 0, 0, 0, 2);
            return;
        }
        if( _period > gPeriodsPerYear ) {
            emit evPaymentAdded(_year, _period, _day, 0, 0, 0, 3);
            return;
        }
        if( _period == 0 ) {
            emit evPaymentAdded(_year, _period, _day, 0, 0, 0, 4);
            return;
        }
        if( getPeriodInd( gYearPayFirst, gPeriodPayFirst) == 0 ) {
            emit evPaymentAdded(_year, _period, _day, 0, 0, 0, 5);
            return;
        }
        if( getPeriodInd(_year, _period) < getPeriodInd( gYearPayFirst, gPeriodPayFirst) ) {
            emit evPaymentAdded(_year, _period, _day, 0, 0, 0, 6);
            return;
        }
        Payment memory _paym;
        _paym.day = _day;
        _paym.value = _value;
        _paym.signDebitCredit = _signDebitCredit;

    	//AY transfer of stable coins (dollars)
        //ERC20Interface usdToken = ERC20Interface( _usdTokenAddr );
        //uint256 _decPowered = 10**usdToken.decimals();
        //usdToken.transfer( gMortgages[_indMortg].accumAccount, _value*_decPowered );

        gPayments[getPeriodInd(_year, _period)].dateLast = now;  // !!! TODO
        gPayments[getPeriodInd(_year, _period)].payments.push(_paym);
        if( getPeriodInd(_year, _period) > getPeriodInd( gYearPayLast, gPeriodPayLast) ){
            gYearPayLast = _year;
            gPeriodPayLast = _period;
        }
        emit evPaymentAdded( _year, _period, _day,
            gPayments[getPeriodInd(_year, _period)].payments.length, _value, _signDebitCredit, 0);
    }

    function addInstallment(uint _year, uint _period, uint _day, int _value) public onlyOwner {
        addPayment(_year, _period, _day, _value, /* signDebitCredit = */ 1);
    }
    function addInstallmentNow(uint _day, int _value) public onlyOwner {
        uint _year = getYear(now);
        uint _period = getMonth(now);
        addPayment(_year, _period, _day, _value, /* signDebitCredit = */ 1);
    }

    /**
        errCode:
                0 = success
                10, with value of getPeriodInd(_Bad_year, _Bad_period) = no SPV transfer (credit payment) before month _period of _year
                1 = gYearPayFirst, gPeriodPayFirst was not initiated

     */
    function transferMonthlyToSPV(uint _year, uint _period, uint _day) public onlyOwner {
        //ERC20Interface usdToken = ERC20Interface( _usdTokenAddr );
        //uint256 _decPowered = 10**usdToken.decimals();
        //usdToken.transfer( gMortgages[_indMortg].accumAccount, _SPV, gMonthlyPayment );
        int _arrears;
        int _balance;
        uint _errCode;
        (_arrears, _errCode) = getTotalArrears(_year, _period);
        if(_errCode != 0) {
            emit evPaymentAdded(_year, _period, _day, _errCode, 0, 0, 10);
            return;
        }
        (_balance, _errCode) = getTotalBalance();
        if(_errCode != 0) {
            emit evPaymentAdded(_year, _period, _day, 0, 0, 0, 1);
            return;
        }
        int _value = gMonthlyPaymentValue + _arrears;
        if(_value > _balance) {
            _value = _balance;
        }
        addPayment(_year, _period, _day, _value, /* signDebitCredit = */ -1);
    }


    /**
        returns:
           _errCode:
                0 = success
                1 = PaymentArr was not initiated for this period
                >=10 = Balance history has a negative accumulative value at step (_errCode-10)
     */
    function getPeriodBalance(uint _year, uint _period)
             public view returns (int _value, uint _errCode) {

        _value = 0;
        if( gPayments[getPeriodInd(_year, _period)].dateLast == 0 ) {
            return (0, 1);
        }
        for( uint i=0; i < gPayments[getPeriodInd(_year, _period)].payments.length; i++ ) {
            if( gPayments[getPeriodInd(_year, _period)].payments[i].deleted == true ) {
                continue;
            }
            int _payment = gPayments[getPeriodInd(_year, _period)].payments[i].value *
                        gPayments[getPeriodInd(_year, _period)].payments[i].signDebitCredit;
            if( (_payment + _value) < 0 ) {
                return (0, 10+i);
            }
            _value = _value + gPayments[getPeriodInd(_year, _period)].payments[i].value 
                            * gPayments[getPeriodInd(_year, _period)].payments[i].signDebitCredit;
        }
        return (_value, 0);
    }

    /**
        returns:
           _errCode:
                0 = success
                1 = PaymentArr was not initiated for this period
                2 = No transfers to SPV for the period (no credit transactions)
     */
    function getPeriodArrears(uint _year, uint _period)
             public view returns (int _value, uint _errCode) {

        _value = 0;
        if( gPayments[getPeriodInd(_year, _period)].dateLast == 0 ) {
            return (0, 1);
        }
        for( uint i = 0; i < gPayments[getPeriodInd(_year, _period)].payments.length; i++ ) {
            if( gPayments[getPeriodInd(_year, _period)].payments[i].deleted == true ) {
                continue;
            }
            if( gPayments[getPeriodInd(_year, _period)].payments[i].signDebitCredit < 0 ) {
                _value = _value + gPayments[getPeriodInd(_year, _period)].payments[i].value;
            }
        }

        if( _value == 0 ) {
            return (0, 2);
        }
        return ( gMonthlyPaymentValue - _value, 0);
    }

    /**
        returns:
           _errCode:
                0 = success
                1 = gYearPayFirst, gPeriodPayFirst was not initiated
     */
    function getTotalBalance() public view returns (int _value, uint _errCode) {
        uint _yearFinal;
        uint _periodFinal;
        _value = 0;
        (_yearFinal, _periodFinal, _errCode) = getFinalYearPeriod();
        if(_errCode != 0) {
            return (0, 1);
        }

        for( uint _iYear = gYearPayFirst; _iYear <= _yearFinal; _iYear++ ) {
            uint _perLoopFinal = gPeriodsPerYear;
            if(  _iYear == _yearFinal ) {
                _perLoopFinal = _periodFinal;
            }
            uint _perLoopFirst = 1;
            if(  _iYear == gYearPayFirst ) {
                _perLoopFirst = gPeriodPayFirst;
            }
            for( uint _iPeriod = _perLoopFirst; _iPeriod <= _perLoopFinal; _iPeriod++ ) {
                int _tempValue = 0;
                (_tempValue, _errCode) = getPeriodBalance(_iYear, _iPeriod);
                if(_errCode != 0) {
                    continue;
                }
                _value = _value + _tempValue;
            }
        }
        return (_value, 0);
    }

    /**
        returns:
           _errCode:
                0 = success
                getPeriodInd(_Bad_year, _Bad_period) = no SPV transfer (credit payment) before month _period of _year
     */
    function getTotalArrears(uint _year, uint _period) public view returns (int _value, uint _errCode) {
        uint _yearFinal = _year;
        uint _periodFinal = _period;
        _value = 0;

        for( uint _iYear = gYearPayFirst; _iYear <= _yearFinal; _iYear++ ) {
            uint _perLoopFinal = gPeriodsPerYear;
            if(  _iYear == _yearFinal ) {
                _perLoopFinal = _periodFinal;
            }
            uint _perLoopFirst = 1;
            if(  _iYear == gYearPayFirst ) {
                _perLoopFirst = gPeriodPayFirst;
            }
            for( uint _iPeriod = _perLoopFirst; _iPeriod <= _perLoopFinal; _iPeriod++ ) {
                int _tempValue = 0;
                (_tempValue, _errCode) = getPeriodArrears(_iYear, _iPeriod);
                if(_errCode == 2 && ( _iYear != _yearFinal || _iPeriod != _periodFinal ) ){
                    return (0, getPeriodInd(_iYear, _iPeriod));
                }
                if(_errCode != 0) {
                    continue;
                }
                _value = _value + _tempValue;
            }
        }
        return (_value, 0);
    }


}
