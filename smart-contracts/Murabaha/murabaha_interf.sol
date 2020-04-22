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



contract MurabahaInterface {
    //---------------------------------------------------------------------------
    // MORTGAGE SPECIFIC FUNCTIONS

    // errCode = 1 -- gYearPayFirst, gPeriodPayFirst are not inited
    function getFinalYearPeriod() public view returns(uint finalYear, uint finalPeriod, uint errCode);

    /**
        _year -- example: 2019
        _period -- starts with 1,  <= gPeriodsPerYear
     */
    function getPeriodInd(uint _year, uint _period) public pure returns(uint res);

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
    function addPayment(uint _year, uint _period, uint _day, int _value, int _signDebitCredit) public;

    function addInstallment(uint _year, uint _period, uint _day, int _value) public;
    function addInstallmentNow(uint _day, int _value) public;

    /**
        errCode:
                0 = success
                10, with value of getPeriodInd(_Bad_year, _Bad_period) = no SPV transfer (credit payment) before month _period of _year
                1 = gYearPayFirst, gPeriodPayFirst was not initiated

     */
    function transferMonthlyToSPV(uint _year, uint _period, uint _day) public;

    /**
        returns:
           _errCode:
                0 = success
                1 = PaymentArr was not initiated for this period
                >=10 = Balance history has a negative accumulative value at step (_errCode-10)
     */
    function getPeriodBalance(uint _year, uint _period)
             public view returns (int _value, uint _errCode);

    /**
        returns:
           _errCode:
                0 = success
                1 = PaymentArr was not initiated for this period
                2 = No transfers to SPV for the period (no credit transactions)
     */
    function getPeriodArrears(uint _year, uint _period)
             public view returns (int _value, uint _errCode);

    /**
        returns:
           _errCode:
                0 = success
                1 = gYearPayFirst, gPeriodPayFirst was not initiated
     */
    function getTotalBalance() public view returns (int _value, uint _errCode);

    /**
        returns:
           _errCode:
                0 = success
                getPeriodInd(_Bad_year, _Bad_period) = no SPV transfer (credit payment) before month _period of _year
     */
    function getTotalArrears(uint _year, uint _period) public view returns (int _value, uint _errCode);


}
