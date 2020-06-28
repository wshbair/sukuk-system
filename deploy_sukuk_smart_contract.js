var Web3 = require('web3');
const HDWalletProvider = require("truffle-hdwallet-provider");
const { abi, bytecode } = require("./truffle/contracts/CXCSukuk.json");

const fs = require('fs');
var provider = new HDWalletProvider('885dd679ff168a152d7492bcfb85cf5d4cc6312d7f329442168f5b18c00e5f31', "https://rinkeby.infura.io/v3/cedb2f80c0cd4a3c99a668222fe86a49")
const sqlite3 = require('sqlite3').verbose();
//--------------------------------------------------------------
// Connect to database	
//--------------------------------------------------------------
let db = new sqlite3.Database('main.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to Main database.');
});

const options = {
    defaultAccount: '0x9d918279261d0fB6C99A3dEb3267dB788eAaD0C5',
    defaultBlock: 'latest',
    defaultGas: 1,
    defaultGasPrice: 0,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 2,
    transactionPollingTimeout: 480,  
  }
  
const web3 = new Web3(provider,null, options);
var ownerAddress="0x9fc3d36C008ACDb4f1Aa15046850050478a988A1";

  (async () => {
    const contract = await new web3.eth.Contract(abi)
        .deploy({
          data: bytecode,
          arguments: ["2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x3C0E7d82313D5B3cecff6fAcd5E3f40f9d841e68']
        })
        .send({ from: ownerAddress});
         
      console.log("Contract address:", contract.options.address);
      fs.writeFileSync('sukuk_contract_address.json', JSON.stringify({"address":contract.options.address}));
      //update database
      db.all('SELECT * FROM notary ORDER by id DESC LIMIT 1', (err,rows)=>{
        var updatedField = 'sukuk_smart_contract';
        let sql = `UPDATE notary SET `+updatedField +` = ?  WHERE id = ?`;
        db.run(sql,1,rows[0].id, (err,rows)=>{
        process.exit(0);
        })
      })
    })()