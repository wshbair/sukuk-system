
// Script to broadcast installments to blockchain 
// Developed by Wazen Shbair (wazen.shbair@gmail.com), University of Luxembourg- SnT
// June, 2020
'use strict';
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
    //console.log('Connected to Main database.');
  });

//--------------------------------------------------------------
// Smart contracts configuration 
//--------------------------------------------------------------
var cxcMurabaha = require("./truffle/contracts/CXCMurabaha.json");
var murabahaContractAddr= require("./murabaha_contract_address.json").address
var murabahaContractInstance= new web3.eth.Contract(cxcMurabaha.abi,murabahaContractAddr);
var cxcSukuk = require("./truffle/contracts/CXCSukuk.json");

var sukukContractAddr= require("./sukuk_contract_address.json").address
var sukukContractInstance= new web3.eth.Contract(cxcSukuk.abi,sukukContractAddr);

var ownerAddress="0x9fc3d36C008ACDb4f1Aa15046850050478a988A1" 

//--------------------------------------------------------------
//  Broadcaster Module
//--------------------------------------------------------------
var broadcaster ={
    broadcastInstallments: async function(){
        console.log("[Broadcaster] Installments broadcasting ...")
        await db.all('SELECT * FROM temp_installments WHERE inBlockchain IS NULL', (err,rows)=>{
            if(rows.length>0)
            {
            //console.log('Number of installments ', rows.length)
            const forLoop = async _ => {
              for (let index = 0; index < 6; index++) {
                console.log("[Broadcaster] installment Id: ", rows[index].Id)
                var timestamp = rows[index].Date
                var capital = parseInt(rows[index].Capital)
                var reumn = parseInt(rows[index].Remun)
                var rembCapital = parseInt(rows[index].Remb_Capital)
        
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
                  //console.log(`Row(s) updated: ${this.changes}`);
                  return true
                });
                })
                .on('error', function(error){
                })
               }
                
            }
            forLoop().then( async function(error,result){
            console.log('[Broadcaster] all installments are broadcasted')
             db.all('SELECT * FROM notary ORDER by id DESC LIMIT 1', async (err,rows)=>{
              var updatedField = 'installment_broadcasted';
              let sql = `UPDATE notary SET `+updatedField +` = ?  WHERE id = ?`;
              await db.run(sql,1,rows[0].id, (err,rows)=>{
                db.close()
              })
            })
            
            })
        
            }
            else
            {
              console.log('[Broadcaster] no installment to broadcast')
             // process.exit(0);
            }
        
            if(err)
            {
              console.log('[Broadcaster] error in broadcasting installment')
            }
        
          }) 
    },
    broadcastCoupon: async function(){
        console.log("[Broadcaster] coupons broadcasting ...")
        await db.all('SELECT * FROM temp_coupons WHERE inBlockchain IS NULL', (err,rows)=>{
            if(rows.length > 0)
            {
            //console.log("[Broadcaster] rows number ", rows.length)
            const forLoop = async _ => {
              for (let index = 0; index < 1; index++) {
                console.log("[Broadcaster] coupon Id: ", rows[index].Id)
                var timestamp = parseInt(rows[index].Date)
                var capital = parseInt(rows[index].Capital)
                var reumn = parseInt(rows[index].Remun)
                var rembCapital = parseInt(rows[index].Remb_Capital)
        
                await sukukContractInstance.methods.ScheduleCoupon(timestamp, capital, reumn, rembCapital)
                .send({from:ownerAddress, gas:208408})
                .on('receipt', async function(receipt)
                {
                 let data= [1,rows[index].Id]
                 let sql = `UPDATE temp_coupons SET inBlockchain = ?  WHERE id = ?`;
                 await db.run(sql, data, function(err) {
                  if (err) {
                    console.error(err.message);
                  }
                  //console.log(`[Broadcaster] row(s) updated: ${this.changes}`);
                  return true
                });
                 })
                .on('error', function(error){
                  console.log(error)
                });
               }
               return true
            }
            forLoop().then(function(error,result){
                console.log('[Broadcaster] all coupons are broadcasted')
                db.all('SELECT * FROM notary ORDER by id DESC LIMIT 1', async (err,rows)=>{
                  var updatedField = 'coupon_broadcasted';
                  let sql = `UPDATE notary SET `+updatedField +` = ?  WHERE id = ?`;
                  await db.run(sql,1,rows[0].id, (err,rows)=>{
                    //process.exit(0);
                  })
                })
                
                }) 
        
            }
            else
            {
              console.log('[Broadcaster] no coupon to broadcast')
              //process.exit(0)
            }
            if (err)
            {
              console.log(err)
              process.exit(0)
            }
        
          })
    }
}

module.exports = broadcaster;
