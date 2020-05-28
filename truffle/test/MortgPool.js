const MortgPool = artifacts.require("./MortgPool.sol");

contract("MortgPool", accounts => {
  it("should display 0", async () => {
    const pool = await MortgPool.deployed();      
    const poolLen= await pool.getMortgageLen.call();
    assert.equal(poolLen, 0);
  });

  it("account [0] balance should be 0", async () => {
    const pool = await MortgPool.deployed();      
    let balance= await pool.balanceOf.call(accounts[0]);
    assert.equal(balance, 0);
  });
});