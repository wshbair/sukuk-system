
// Script to broadcast installments to blockchain 
// Developed by Wazen Shbair (wazen.shbair@gmail.com), University of Luxembourg- SnT
// June, 2020

const sqlite3 = require('sqlite3').verbose();
const Web3 = require('web3')
const HDWalletProvider = require("truffle-hdwallet-provider");
var provider = new HDWalletProvider('885dd679ff168a152d7492bcfb85cf5d4cc6312d7f329442168f5b18c00e5f31', "https://rinkeby.infura.io/v3/cedb2f80c0cd4a3c99a668222fe86a49")

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
    console.log('Connected to Main database.');
  });

//--------------------------------------------------------------
// Murabaha smart contracts configuration 
//--------------------------------------------------------------
var cxcMurabaha = require("./truffle/contracts/CXCMurabaha.json");
var murabahaContractAddr= require("./murabaha_contract_address.json").address
var murabahaContractInstance= new web3.eth.Contract(cxcMurabaha.abi,murabahaContractAddr);
var ownerAddress="0x9fc3d36C008ACDb4f1Aa15046850050478a988A1" 

//--------------------------------------------------------------
// Installment broadcasting to blockchain 
//--------------------------------------------------------------
db.all('SELECT * FROM temp_installments WHERE inBlockchain IS NULL', (err,rows)=>{
    if(rows.length>0)
    {
      console.log('Number of installments ', rows.length)
    const forLoop = async _ => {
      for (let index = 0; index < 10; index++) {
        console.log("installment Id: ", rows[index].Id)
        timestamp = rows[index].Date
        capital = parseInt(rows[index].Capital)
        reumn = parseInt(rows[index].Remun)
        rembCapital = parseInt(rows[index].Remb_Capital)

        await murabahaContractInstance.methods.ScheduleInstallment(timestamp, capital, reumn, rembCapital)
        .send({from:ownerAddress, gas:208408})
        .on('receipt',async function(receipt)
        {
          let data= [1,rows[index].Id]
         let sql = `UPDATE temp_installments SET inBlockchain = ? WHERE id = ?`;
         await db.run(sql, data, function(err) {
          if (err) {
            console.error(err.message);
          }
          console.log(`Row(s) updated: ${this.changes}`);
          return true
        });
        })
        .on('error', function(error){
        })
       }
        
    }
    forLoop().then( async function(error,result){
    console.log('Installments registration transaction are sent !')  
     db.all('SELECT * FROM notary ORDER by id DESC LIMIT 1', async (err,rows)=>{
      var updatedField = 'installment_broadcasted';
      let sql = `UPDATE notary SET `+updatedField +` = ?  WHERE id = ?`;
      await db.run(sql,1,rows[0].id, (err,rows)=>{
        process.exit(0);
        db.close()
      })
    })
    
    })

    }
    else
    {
      console.log('[Installments] :: No installment to broadcast')
      process.exit(0);
    }

    if(err)
    {
      console.log('[Installments] :: Error in broadcasting')
      process.exit(0);
    }

  }) 