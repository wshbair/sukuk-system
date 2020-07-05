'use strict';

var schedule = require('node-schedule');
const Web3 = require('web3')
var unirest = require('unirest');
const util = require('util');
const HDWalletProvider = require("truffle-hdwallet-provider");
const {Client, Config, CheckoutAPI} = require('@adyen/api-library');
 
// Set your X-API-KEY with the API key from the Customer Area.
const config = new Config();
// Set your X-API-KEY with the API key from the Customer Area.
config.apiKey = 'AQEphmfuXNWTK0Qc+iSEl3cshueYR55DGcQSCdkB2pddm2UQjN6Cw2pXS+gQwV1bDb7kfNy1WIxIIkxgBw==-rjptUwQ3ILf9Ydhg9b5IrNwR9RHhzQuPRB3oXdFreqE=-Xk}Q945CB.gNbs2<';
config.merchantAccount = 'TestAccount781ECOM';
 
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
// Smart contracts configuration 
//--------------------------------------------------------------
var cxcMurabaha = require("../truffle/contracts/CXCMurabaha.json");
var murabahaContractAddr= require("../murabaha_contract_address.json").address
var murabahaContractInstance= new web3.eth.Contract(cxcMurabaha.abi,murabahaContractAddr);

var cxcSukuk = require("../truffle/contracts/CXCSukuk.json");
var sukukContractAddr= require("../sukuk_contract_address.json").address
var sukukContractInstance= new web3.eth.Contract(cxcSukuk.abi,sukukContractAddr);
var ownerAddress="0x9fc3d36C008ACDb4f1Aa15046850050478a988A1" 

const client = new Client({ config });
client.setEnvironment("TEST");

var cxcScheduler = {
    scheduleInstallment: function(unix_timestamp, id) {
        var date = new Date(unix_timestamp * 1000);
         var job = schedule.scheduleJob(date, async function(){
            console.log('installment executed', id)
            console.log('timestamp', date)
            await CollectInstallment()
        });
        return job;
    },

    scheduleCoupon: function(unix_timestamp,id){
        var date = new Date(unix_timestamp * 1000);
         var job = schedule.scheduleJob(date, async function(){
            console.log('coupon executed', id)
            await PayCoupon()
        });
        return job;
    },
    resetSchedular: function(){
        var jobList = schedule.scheduledJobs; //Get All scheduled jobs
        Object.values(jobList).map(job => {
        //console.log("Job name", job.name);
        schedule.cancelJob(job.name);
    })
    }
}

async function CollectInstallment()
{
    await murabahaContractInstance.methods.GetNextInstallment().call()
    .then(async function(installment){
    if(installment[0] !=0)
    {
    var monthlyPayment= parseInt(installment[1])+ parseInt(installment[2])
    const checkout = new CheckoutAPI(client);
        checkout.payments({
            amount: { currency: "EUR", value: monthlyPayment/100},
            paymentMethod: {
                type: 'sepadirectdebit',
                ownerName: 'A. Grand',
                iban: 'FR1420041010050500013M02606'
            },
            reference: installment[0],
            merchantAccount: config.merchantAccount
        }).then(async function(sepaRes){
            console.log('--> Installment Id: ', installment[0])
            console.log('===============================================')
            // add payment on spv collection account 
            //update blockchain with success
            await murabahaContractInstance.methods.UpdateInstallment(installment[0], sepaRes.resultCode.localeCompare("Authorised"),sepaRes.pspReference,sepaRes.amount.value, "SEPA")
            .send({from:ownerAddress, gas:208408})
        })
        .catch(async (err)=>{ // Update blockchain with fail/error 
            console.log(err)
            //update blockchain with success
            await murabahaContractInstance.methods.UpdateInstallment(installment[0],1,err.pspReference,0)
            .send({from:ownerAddress, gas:208408})
        })
    }
            
    })
}

async function PayCoupon()
{
    sukukContractInstance.methods.GetNextCouponId().call()
                .then(function(nextCouponId){
                // Get Coupon value from smart contract 
                murabahaContractInstance.methods.GetCouponValue(nextCouponId).call()
                .then(function(SPVCollectionAccountBalance){
                    //payout command   
                    var req = unirest('POST', 'https://pal-test.adyen.com/pal/servlet/Payout/v52/storeDetailAndSubmitThirdParty')
                    .headers({
                    'x-API-key': 'AQEphmfuXNWTK0Qc+iSEl3cshueYR55DGcQSCdkB2pddm2UQjN6Cw2pXS+gQwV1bDb7kfNy1WIxIIkxgBw==-rjptUwQ3ILf9Ydhg9b5IrNwR9RHhzQuPRB3oXdFreqE=-Xk}Q945CB.gNbs2<',
                    'Content-Type': 'application/json',
                    })
                    .send(JSON.stringify({"amount":{"currency":"EUR","value":SPVCollectionAccountBalance},"bank":{"countryCode":"NL","ownerName":"S. Hopper","iban":"NL13TEST0123456789"},"shopperName":{"firstName":"Simon","gender":"MALE","lastName":"Hopper"},"nationality":"NL","dateOfBirth":"1982-07-17","entityType":"NaturalPerson","merchantAccount":"TestAccount781ECOM","recurring":{"contract":"PAYOUT"},"reference":"YOUR_REFERENCE","shopperEmail":"s.hopper@company.com","shopperReference":"YOUR_UNIQUE_SHOPPER_ID"}))
                    .end(function (res) { 
                    if (res.error) throw new Error(res.error); 
                    
                    console.log("SEPA PAYOUT ", JSON.parse(res.raw_body).pspReference);

                    // Blockchain operation 
                     sukukContractInstance.methods.coupons(nextCouponId).call()
                    .then(function(coupon){
                        if(coupon.id != 0 && coupon.status.localeCompare("Success")!=0)
                        {
                            console.log('--> Coupon value: ', SPVCollectionAccountBalance)
                            console.log('===============================================')
                            //AddRecordToSPVCollectionAccount(0,(SPVCollectionAccountBalance*-1), JSON.parse(res.raw_body).pspReference, 'payout')
                             sukukContractInstance.methods.UpdateCoupon(coupon.id,"Success","123", (SPVCollectionAccountBalance | 0))
                            .send({from:ownerAddress, gas:208408})
                            .then(function(){                                  
                                
                            })
                        }
                            
                    })
                    });
                })

                })
}

module.exports = cxcScheduler;