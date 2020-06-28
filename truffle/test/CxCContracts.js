const CxCSukuk = artifacts.require("CxCSukuk")
const CxCMurabaha = artifacts.require("CXCMurabaha")

contract("CXC Smart Contracts Test Unit", async accounts => {
  
   it("initial setting of coupon and installment", async () => {
    let sukukInstance = await CxCSukuk.deployed("2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x3C0E7d82313D5B3cecff6fAcd5E3f40f9d841e68');
    let murabaInstance = await CxCMurabaha.deployed("2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x077EB264100C4A475D4A7065910109bA30Bb6003')
    
    //sukuk contract
    let couponNumnber= await sukukInstance.NumberOfCoupons.call()
    let sukukPrincipal = await sukukInstance.principal.call()
    //murabha contract
    let installmentNumber =await  murabaInstance.NumberOfInstallments.call()
    let installmentPrincipal = await murabaInstance.principal.call()

    assert.equal(couponNumnber.valueOf(), 0);
    assert.equal(sukukPrincipal.valueOf(),20829200)
    assert.equal(installmentNumber.valueOf(), 0);
    assert.equal(installmentPrincipal.valueOf(),20829200)
  });

  it("schedule 12 installment and 2 coupons", async () => {
    let sukukInstance = await CxCSukuk.deployed("2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x3C0E7d82313D5B3cecff6fAcd5E3f40f9d841e68');
    let murabaInstance = await CxCMurabaha.deployed("2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x077EB264100C4A475D4A7065910109bA30Bb6003')
    
    //sukuk contract
    await sukukInstance.ScheduleCoupon(1588001580,20829152,34715,156940);
    await sukukInstance.ScheduleCoupon(1588001580,20829152,34715,156940);
    let couponNumnber= await sukukInstance.NumberOfCoupons.call()

    //murabha contract
    await murabaInstance.ScheduleInstallment(1593207084,20829152,34715,156940);
    await murabaInstance.ScheduleInstallment(1593207144,20672211,34453,157202);
    await murabaInstance.ScheduleInstallment(1593207204,20515008,34191,157464);
    await murabaInstance.ScheduleInstallment(1593207264,20357544,33929,157726);
    await murabaInstance.ScheduleInstallment(1593207324,20199817,33666,157989);
    await murabaInstance.ScheduleInstallment(1593207384,20041827,33403,158253);
    await murabaInstance.ScheduleInstallment(1593207444,19883574,33139,158516);
    await murabaInstance.ScheduleInstallment(1593207504,19725057,32875,158781);
    await murabaInstance.ScheduleInstallment(1593207564,19566276,32610,159045);
    await murabaInstance.ScheduleInstallment(1593207624,19407230,32345,159310);
    await murabaInstance.ScheduleInstallment(1593207684,19247919,32079,159576);
    await murabaInstance.ScheduleInstallment(1593207744,19088343, 31813,159842);

    let installmentNumber = await  murabaInstance.NumberOfInstallments.call()

    assert.equal(couponNumnber.valueOf(), 2);
    assert.equal(installmentNumber.valueOf(), 12);
  });

  it("add 6 installments (100) and get the coupon value (600)", async () => {
    let sukukInstance = await CxCSukuk.deployed("2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x3C0E7d82313D5B3cecff6fAcd5E3f40f9d841e68');
    let murabaInstance = await CxCMurabaha.deployed("2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x077EB264100C4A475D4A7065910109bA30Bb6003')
    
    //sukuk contract
    await sukukInstance.ScheduleCoupon(1588001580,20829152,34715,156940);
    await sukukInstance.ScheduleCoupon(1588001580,20829152,34715,156940);
    let couponNumnber= await sukukInstance.NumberOfCoupons.call();

    //murabha contract
    await murabaInstance.UpdateInstallment(1,0,"test2020", 100, "SEPA");
    await murabaInstance.UpdateInstallment(2,0,"test2020", 100, "SEPA");
    await murabaInstance.UpdateInstallment(3,0,"test2020", 100, "SEPA");
    await murabaInstance.UpdateInstallment(4,0,"test2020", 100, "SEPA");
    await murabaInstance.UpdateInstallment(5,0,"test2020", 100, "SEPA");
    await murabaInstance.UpdateInstallment(6,0,"test2020", 100, "SEPA");
    await murabaInstance.UpdateInstallment(6,0,"test2020", -100, "SEPA"); // as refund transaction

    let coupon1Value = await murabaInstance.GetCouponValue(1)

    //update coupon in sukuk
    await sukukInstance.UpdateCoupon(1, "success", "test2020",coupon1Value);
    //read coupon value 
    let coupon = await sukukInstance.GetCouponValue(1)
    assert.equal(coupon1Value.valueOf(), 500);
    assert.equal(coupon.valueOf(), 500);
  });
}); // end of test unit class