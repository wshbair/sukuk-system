
// Script to deploy smart contracts 
// Developed by Wazen Shbair (wazen.shbair@gmail.com), University of Luxembourg- SnT
// June, 2020

'use strict';

const sqlite3 = require('sqlite3').verbose();
const Web3 = require('web3')
const fs = require('fs');

const HDWalletProvider = require("truffle-hdwallet-provider");
var provider = new HDWalletProvider('885dd679ff168a152d7492bcfb85cf5d4cc6312d7f329442168f5b18c00e5f31', "https://rinkeby.infura.io/v3/cedb2f80c0cd4a3c99a668222fe86a49")
var ownerAddress="0x9fc3d36C008ACDb4f1Aa15046850050478a988A1" 
const options = {
    defaultAccount: '0x9fc3d36C008ACDb4f1Aa15046850050478a988A1',
    defaultBlock: 'latest',
    defaultGas: 1,
    defaultGasPrice: 0,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 2,
    transactionPollingTimeout: 480, 
   }

const web3 = new Web3(provider,null, options);
//--------------------------------------------------------------
// Connect to database	
//--------------------------------------------------------------
let db = new sqlite3.Database('main.db', (err) => {
    if (err) {
      console.error(err.message);
    }
   });
//--------------------------------------------------------------
//  Deployer Module
//--------------------------------------------------------------
var deployer ={
    deployMurabahaSmartContract: async function(){
        console.log("[Deployer] Deploy Murabaha Smart Contract ...")
        var { abi, bytecode } = require("./truffle/contracts/CXCMurabaha.json");
        const contract = await new web3.eth.Contract(abi)
            .deploy({
                data: bytecode,
                arguments: ["2.0%", 20829200, '0x07d5a077713e756a44A224876109aBF63B154ad3', '0x077EB264100C4A475D4A7065910109bA30Bb6003']
            })
            .send({ from: ownerAddress});
            console.log("[Deployer] Murabaha Contract address:", contract.options.address);
            fs.writeFileSync('murabaha_contract_address.json', JSON.stringify({"address":contract.options.address}));
            //update database
            db.all('SELECT * FROM notary ORDER by id DESC LIMIT 1', (err,rows)=>{
            var updatedField = 'murabaha_smart_contract';
            let sql = `UPDATE notary SET `+updatedField +` = ?  WHERE id = ?`;
            db.run(sql,1,rows[0].id, (err,rows)=>{})
            })
        
    },
    deploySukukSmartContract: async function(){
        console.log("[Deployer] Deploy Sukuk Smart Contract ...")
        var { abi, bytecode } = require("./truffle/contracts/CXCSukuk.json");
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
            db.run(sql,1,rows[0].id, (err,rows)=>{})
        })
    }
}

module.exports = deployer;