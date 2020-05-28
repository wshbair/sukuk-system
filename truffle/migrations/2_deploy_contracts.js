

const CxCSukuk = artifacts.require("CxCSukuk")
const CxCMurabaha = artifacts.require("CXCMurabaha")
const SKXLU =artifacts.require('SKXLU')

// account[2] SPV address, account[3] investor address, account[4] obligor address
module.exports = function(deployer, network, accounts) {
  deployer.deploy(CxCSukuk, "2.0%", 20829200, accounts[2], accounts[3]);
  deployer.deploy(CxCMurabaha,"2.0%", 20829200, accounts[2], accounts[4]);
  deployer.deploy(SKXLU, 200);
};


// module.exports = function(deployer, network, accounts) {

//   deployer.deploy(CryptoUSD,accounts[0]).then(function() {    
//     return deployer.deploy(MortgPool, CryptoUSD.address, accounts[0]);
//   }).then(async()=>{

//     //token initialization
//     var XMRGToken = await MortgPool.deployed();
//     //await XMRGToken.transferOwnership(accounts[1]); 
//     //await XMRGToken.acceptOwnership( {from: accounts[1]})   

//     var usdToken = await CryptoUSD.deployed();
//     //var usdTokenTotalSupply=await usdToken.totalSupply()
//     //console.log(usdTokenTotalSupply/Math.pow(10,18));
    
//     await usdToken.transfer(XMRGToken.address, 50000, {from:accounts[0]})
//     //var CryptoUSDBalance=await usdToken.balanceOf(XMRGToken.address)
//     //console.log("CryptoUSD Balance : "+CryptoUSDBalance)

//     //var XMRGTokenTotalSupply=await XMRGToken.totalSupply()
//     //console.log("XMRGToken total supply "+ XMRGTokenTotalSupply/Math.pow(10,18))
    
//     //await XMRGToken.transfer(accounts[0], 10000, {from:accounts[1]})
//     var accountZeoBalance=await XMRGToken.balanceOf(accounts[0])
//     console.log("Cash holder Balance of XMG tokens: "+accountZeoBalance/Math.pow(10,18))

//     await XMRGToken.addMortgage("Test","Test","Test", {from:accounts[0]})
//     console.log("A new Mortgage added")

 



//   })
// };




// let resTrOwn = await brs.transferOwnership.sendTransaction( web3.eth.accounts[1],
//   { from: web3.eth.accounts[0], gas: 4000000 }, 
//   function(e, result) {
//       if (!e) {
//           console.log('transfer OK'); //  + result.args._ret
//       } else {
//           console.log(e);
//       }
//   }
// )