

const CxCSukuk = artifacts.require("CxCSukuk")
const CxCMurabaha = artifacts.require("CXCMurabaha")
const SKXLU =artifacts.require('SKXLU')

// account[2] SPV address, account[3] investor address, account[4] obligor address
module.exports = function(deployer, network, accounts) {
  deployer.deploy(CxCSukuk, "2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x3C0E7d82313D5B3cecff6fAcd5E3f40f9d841e68');
  deployer.deploy(CxCMurabaha,"2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x077EB264100C4A475D4A7065910109bA30Bb6003');
  //deployer.deploy(SKXLU, 200);
}; 