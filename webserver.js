const express = require('express');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const xlsxFile = require('read-excel-file/node');
const multer = require('multer');
var cors = require('cors')
var bodyParser = require('body-parser')
const Web3 = require('web3')
const crypto = require('crypto');
var compression = require('compression')
var unirest = require('unirest');
var sha1 = require('sha1');
const HDWalletProvider = require("truffle-hdwallet-provider");
const util = require('util');
const {spawn } = require('child_process');
const broadcaster = require('./broadcaster');
const deployer = require('./deployer');


const options = {
  defaultAccount: '0x9fc3d36C008ACDb4f1Aa15046850050478a988A1',
  defaultBlock: 'latest',
  defaultGas: 1,
  defaultGasPrice: 0,
  transactionBlockTimeout: 50,
  transactionConfirmationBlocks: 2,
  transactionPollingTimeout: 480, 
 }

var provider = new HDWalletProvider('885dd679ff168a152d7492bcfb85cf5d4cc6312d7f329442168f5b18c00e5f31', "https://rinkeby.infura.io/v3/cedb2f80c0cd4a3c99a668222fe86a49")

//***************************************************************
// Set your X-API-KEY with the API key from the Customer Area.
const {Client, Config, CheckoutAPI} = require('@adyen/api-library');
const config = new Config();
// Set your X-API-KEY with the API key from the Customer Area.
config.apiKey = 'AQEphmfuXNWTK0Qc+iSEl3cshueYR55DGcQSCdkB2pddm2UQjN6Cw2pXS+gQwV1bDb7kfNy1WIxIIkxgBw==-rjptUwQ3ILf9Ydhg9b5IrNwR9RHhzQuPRB3oXdFreqE=-Xk}Q945CB.gNbs2<';
config.merchantAccount = 'TestAccount781ECOM';
//***************************************************************

var SPVCollectionAccount=0
var invertorAccount=0
var obligorAccount=30000000

global.__basedir = __dirname;
const web3 = new Web3(provider,null, options);
//const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/cedb2f80c0cd4a3c99a668222fe86a49"));
//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
console.log('[web3]::: version '+web3.version)

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
// Express server configuration
//--------------------------------------------------------------
const app = express();
app.use(cors())
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static('./webApp/public'))
app.use(express.static('./webApp/uploads/'))

app.use(compression())

//--------------------------------------------------------------
// File upload service 
//--------------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       cb(null, __basedir + '/webApp/uploads/')
    },
    filename: (req, file, cb) => {
       cb(null, file.originalname)
    }
  });

  const upload = multer({storage: storage});

// Express Upload RestAPIs
app.post('/api/uploadfile', upload.single("uploadfile"), (req, res) =>{
    filePath='./webApp/uploads/'+req.file.originalname
    saveFile2DB(req.file.originalname, req.body.type,filePath)

    res.json({
        'msg': 'File uploaded successfully!', 'file': req.file.originalname
      });
});

function xlsxFile2MySQLDatBase(filePath)
{
    xlsxFile(filePath).then((rows) => { 
        rows.shift();
        for (i in rows){
            db.run("INSERT INTO temp_installments(Date, Id, Capital, Remun, Remb_Capital, CRD) values(?,?,?,?,?,?)", 
            rows[i][0], rows[i][1], rows[i][2],rows[i][3], rows[i][4], rows[i][5], (err,rows)=>{
                if(err){
                    //throw err
                    return false
                }
            })
        }
});
}

function saveFile2DB(name, type, filePath)
{
  let file_buffer = fs.readFileSync(filePath);
  let sum = crypto.createHash('sha256');
  sum.update(file_buffer);
  const hash = sum.digest('hex');
  db.run('INSERT INTO file_uploads(name, type, hash, valid, version) values(?,?,?,?,?)', name,type, hash, 0, 1,
  (err,rows)=>{
    if(err)
    throw err
  })
}

//--------------------------------------------------------------
// Smart contracts configuration 
//--------------------------------------------------------------
try
{
//Murabaha
//var cxcMurabaha = require("./truffle/contracts/CXCMurabaha.json");
//var murabahaContractAddr=Object.values(cxcMurabaha.networks)[1].address;

var cxcMurabaha = require("./truffle/contracts/CXCMurabaha.json");
var murabahaContractAddr= require("./murabaha_contract_address.json").address
var murabahaContractInstance= new web3.eth.Contract(cxcMurabaha.abi,murabahaContractAddr);

//Sukuk 
//var cxcSukuk = require("./truffle/contracts/CXCSukuk.json");
//var sukukContractAddr=Object.values(cxcSukuk.networks)[1].address;

var cxcSukuk = require("./truffle/contracts/CXCSukuk.json");
var sukukContractAddr= require("./sukuk_contract_address.json").address
var sukukContractInstance= new web3.eth.Contract(cxcSukuk.abi,sukukContractAddr);
}
catch(err)
{
  console.log('[Smart Contract] Error In Smart contracts')
  console.log(err)
}


var ownerAddress="0x9fc3d36C008ACDb4f1Aa15046850050478a988A1"
 
//--------------------------------------------------------------
// Main web pages
//--------------------------------------------------------------
app.get('/', (req, res) => res.sendFile(__dirname + '/webApp/default.html'))
app.get('/index.html', (req, res) => res.sendFile(__dirname + '/webApp/index.html'))
app.get('/sukuk.html', (req, res) => res.sendFile(__dirname + '/webApp/sukuk.html'))
app.get('/monitoring.html', (req,res)=> res.sendFile(__dirname + '/webApp/monitoring.html'))
app.get('/murabaha.html', (req,res)=> res.sendFile(__dirname + '/webApp/murabaha.html'))
app.get('/notary.html', (req,res)=> res.sendFile(__dirname + '/webApp/notary.html'))
app.get('/mandate.html', (req,res)=>res.sendFile(__dirname+'/webApp/mandate.html'))
app.get('/murabaha-manual-collection.html', (req,res)=>res.sendFile(__dirname+'/webApp/murabaha-manual-collection.html'))
app.get('/sukuk_investor.html', (req,res)=>res.sendFile(__dirname+'/webApp/sukuk_investor.html'))
app.get('/monitoring_agent.html', (req,res)=> res.sendFile(__dirname + '/webApp/monitoring_agent.html'))
app.get('/sukuk-notary.html', (req,res)=> res.sendFile(__dirname + '/webApp/sukuk-notary.html'))
app.get('/monitoring_notary.html', (req,res)=> res.sendFile(__dirname + '/webApp/monitoring_notary.html'))
app.get('/murabaha-notary.html', (req,res)=> res.sendFile(__dirname + '/webApp/murabaha-notary.html'))


//--------------------------------------------------------------
// Murabha Contract
//--------------------------------------------------------------
// Add Murabha installment 
app.post('/api/installment/add', function(req,res){
  timestamp = req.body.timestamp
  capital = req.body.capital
  reumn = req.body.reumn
  rembCapital= req.body.rembCapital

  murabahaContractInstance.methods.ScheduleInstallment(timestamp, capital, reumn, rembCapital)
  .send({from:ownerAddress, gas:208408}) 
  .on('confirmation', function(confirmationNumber, receipt)
  {
    res.json(receipt)
  })
  .on('error', function(error){
    res.status(404).send({
      error: 'Error',
      description: error.message,
  })
  });
})

//Update installment 
app.post('/api/installment/update', function(req,res){
  id = req.body.id
  status = req.body.status
  TxId= req.body.TxId
  value = parseInt(req.body.value).toFixed(0)
  type=req.body.type

  murabahaContractInstance.methods.UpdateInstallment(id,status,TxId,value,type)
  .send({from:ownerAddress, gas:208408})
  .on('confirmation', function(confirmationNumber, receipt)
  {
    res.json(receipt)
    obligorAccount=obligorAccount-parseInt(value)
    SPVCollectionAccount= SPVCollectionAccount+parseInt(value)
  })
  .on('error', function(error){
    res.status(404).send({
      error: 'Error',
      description: error.message,
  })
  });

})
// Get all installments
app.get('/api/installment/all', function(req,res){
  allInstallment =[]
  murabahaContractInstance.methods.NumberOfInstallments().call()
  .then(async function(len){
    if(len > 0)
    {
      for(i=1; i<=len; i++)
        {
          await murabahaContractInstance.methods.installments(i).call()
          .then(function(result){
            allInstallment.push(result)
            if(allInstallment.length==len)
            res.json(allInstallment)
          })
        }
    }
    else
    res.json(allInstallment)
    
  })
  })

  // Get installment 
  app.get('/api/installment/:id', function(req,res){
    var id = req.params.id;
    murabahaContractInstance.methods.installments(id).call()
          .then(function(installment){
            if(installment.id != 0)
              res.json(installment)
              else
              res.status(404).send({
                msg: 'Installment not found!',
            })
          })
  })

  // Get Installment sub payment 
  app.get('/api/installment/payments/:id', function(req,res){
    var id = req.params.id;
    Payments=[]
    murabahaContractInstance.methods.installments(id).call()
    .then(async function(installment){
      if(installment.id !=0)
      {
        var length = installment.paymentsLength;
        for(i=1; i<=length; i++)
        {
         await murabahaContractInstance.methods.GetPayments(id,i).call()
         .then(function(record){
          Payments.push({'id': record[0], 'timestamp':record[1], 'value':record[2], 'status':record[3], 'TxId':record[4], 'paymentType':record[5]})
         })
        }
        res.json(Payments)
      }
      else
      res.status(404).send({msg: 'Installment not found!'})
    })
  })
  // Get total sub payment 
  app.get('/api/installment/payments/total/:id', function(req,res){
    var id = req.params.id;
    var total=0
    murabahaContractInstance.methods.installments(id).call()
    .then(async function(installment){
      if(installment.id !=0)
      {
        var length = installment.paymentsLength;
        for(i=1; i<=length; i++)
        {
         await murabahaContractInstance.methods.GetPayments(id,i).call()
         .then(function(record){
          total=total+ parseInt(record[2])
         })
        }
        res.json(total)
      }
      else
      res.status(404).send({msg: 'Installment not found!'})
    })
  })

// Get an overview of Murabha smart contract
app.get('/api/murabaha/overview/owner', function(req,res){
  murabahaContractInstance.methods.owner().call()
  .then(function(result) {res.json({"contractOwner": result}) } )
})
app.get('/api/murabaha/overview/numberofinstallments', function(req,res){
  murabahaContractInstance.methods.NumberOfInstallments().call()
  .then(function(result) {res.json({"installmentsNumber": result}) } )
})
app.get('/api/murabaha/overview/tenor', function(req,res){
  murabahaContractInstance.methods.tenor().call()
  .then(function(result) {res.json({"tenor": result}) } )
})
app.get('/api/murabaha/overview/paymentFrequency', function(req,res){
  murabahaContractInstance.methods.paymentFrequency().call()
  .then(function(result) {res.json({"paymentFrequency": result}) } )
})
app.get('/api/murabaha/overview/profitRate', function(req,res){
  murabahaContractInstance.methods.profitRate().call()
  .then(function(result) {res.json({"profitRate": result}) } )
})
app.get('/api/murabaha/overview/principal', function(req,res){
  murabahaContractInstance.methods.principal().call()
  .then(function(result) {res.json({"principal": result}) } )
})
app.get('/api/murabaha/overview/SPVaddres', function(req,res){
  murabahaContractInstance.methods.SPVAddr().call()
  .then(function(result) {res.json({"SPVAddress": result}) } )
})
app.get('/api/murabaha/overview/obligoraddress', function(req,res){
  murabahaContractInstance.methods.obligorAddr().call()
  .then(function(result) {res.json({"obligorAddress": result}) } )
})
//--------------------------------------------------------------
//Sukuk Contract
//--------------------------------------------------------------
// Add Sukuk coupon 
app.post('/api/coupon/add', function(req,res){
  timestamp = req.body.timestamp
  capital = req.body.capital
  reumn = req.body.reumn
  rembCapital= req.body.rembCapital

  sukukContractInstance.methods.ScheduleCoupon(timestamp, capital, reumn, rembCapital)
  .send({from:ownerAddress, gas:208408})
  .on('confirmation', function(confirmationNumber, receipt)
  {
    res.json(receipt)
  })
  .on('error', function(error){
    res.status(404).send({
      error: 'Error',
      description: error.message,
  })
  });
})

//Update coupon 
app.post('/api/coupon/update', function(req,res){
  id = req.body.id
  status = req.body.status
  mongoPayTxId= req.body.mongoPayTxId
  value = req.body.value

  sukukContractInstance.methods.UpdateCoupon(id,status,mongoPayTxId,value)
  .send({from:ownerAddress, gas:208408})
  .on('confirmation', function(confirmationNumber, receipt)
  {
    res.json(receipt)
  })
  .on('error', function(error){
    res.status(404).send({
      error: 'Error',
      description: error.message,
  })
  });

})

// Get total coupon per year 
app.post('/api/coupon/total', function(req,res){
  year = req.body.year
  sukukContractInstance.methods.TotalCouponsPerYear(year)
  .call( function(error,result) { 
    if(!error)
      res.json({"totalCoupons": result}) 
      else
      res.status(404).send({
        error: 'Error',
        description: error.message,
    })
  })
   
})

// Get all coupons
app.get('/api/coupon/all', function(req,res){
  allCoupons =[]
  sukukContractInstance.methods.NumberOfCoupons().call()
  .then(async function(len){
    if(len > 0)
    {
      for(i=1; i<=len; i++)
        {
          await sukukContractInstance.methods.coupons(i).call()
          .then(function(result){
            allCoupons.push(result)
            if(allCoupons.length==len)
            res.json(allCoupons)
          })
        }
    }
    else
    res.json(allCoupons)
    
  })
  })

  // Get Coupon 
  app.get('/api/coupon/:id', function(req,res){
    var id = req.params.id;
    sukukContractInstance.methods.coupons(id).call()
          .then(function(coupon){
            if(coupon.id != 0)
              res.json(coupon)
              else
              res.status(404).send({
                msg: 'Coupon not found!',
            })
          })
  })

// Get an overview of Sukuk smart contract
app.get('/api/sukuk/overview/owner', function(req,res){
  sukukContractInstance.methods.owner().call()
  .then(function(result) {res.json({"contractOwner": result}) } )
})
app.get('/api/sukuk/overview/numberofcopons', function(req,res){
  sukukContractInstance.methods.NumberOfCoupons().call()
  .then(function(result) {res.json({"couponsNumber": result}) } )
})
app.get('/api/sukuk/overview/tenor', function(req,res){
  sukukContractInstance.methods.tenor().call()
  .then(function(result) {res.json({"tenor": result}) } )
})
app.get('/api/sukuk/overview/paymentFrequency', function(req,res){
  sukukContractInstance.methods.paymentFrequency().call()
  .then(function(result) {res.json({"paymentFrequency": result}) } )
})
app.get('/api/sukuk/overview/profitRate', function(req,res){
  sukukContractInstance.methods.profitRate().call()
  .then(function(result) {res.json({"profitRate": result}) } )
})
app.get('/api/sukuk/overview/principal', function(req,res){
  sukukContractInstance.methods.principal().call()
  .then(function(result) {res.json({"principal": result}) } )
})
app.get('/api/sukuk/overview/SPVaddres', function(req,res){
  sukukContractInstance.methods.SPVAddr().call()
  .then(function(result) {res.json({"SPVAddress": result}) } )
})
app.get('/api/sukuk/overview/investorAddress', function(req,res){
  sukukContractInstance.methods.investorAddr().call()
  .then(function(result) {res.json({"investorAddr": result}) } )
})

//--------------------------------------------------------------
// Get Ethereum Address
//--------------------------------------------------------------
app.get('/api/ethereum/address', function(req,res){
  res.json('0x'+sha1('!@superpassword'+ Math.random()))
})
//------------------------------------------------------------------------
// Add Counterpart
//------------------------------------------------------------------------
app.post('/api/counterparts/add', function(req,res){
  var original_seller_name =  req.body.original_seller_name
	var original_seller_address = req.body.original_seller_address
	var solo_investor_name = req.body.solo_investor_name
	var solo_investor_address = req.body.solo_investor_address
	var solo_investor_payment_account_id = req.body.solo_investor_payment_account_id
	var solo_investor_eth_addr = req.body.solo_investor_eth_addr
  var purchaser_name = req.body.purchaser_name
	var purchaser_address = req.body.purchaser_address  
	var purchaser_payment_account_id = req.body.purchaser_payment_account_id
  var purchaser_EthAddr = req.body.purchaser_EthAddr

  var validation1A = req.body.validation1A
  var validation1B = req.body.validation1B
  var validation1C = req.body.validation1C

  db.run('INSERT INTO counterparts(original_seller_name, original_seller_address'+
         ',solo_investor_name,solo_investor_address,solo_investor_eth_address, solo_investor_payment_account_id,'+
         'purchaser_name,purchaser_address,purchaser_eth_address,purchaser_payment_account_id,validation1A,validation1B,validation1C) values(?,?,?,?,?,?,?,?,?,?,?,?,?)', 
         original_seller_name,original_seller_address,
         solo_investor_name,solo_investor_address,solo_investor_eth_addr,solo_investor_payment_account_id,
         purchaser_name, purchaser_address, purchaser_EthAddr,purchaser_payment_account_id, 
         validation1A, validation1B, validation1C,
  (err,rows)=>{
    if(err)
    {
      console.log(err)
    res.json({
      'msg': 'Error! : '+ err
    });
    }
    else
    res.json({
      'msg': 'Counterparts Information SAVED Successfully!'
    });
  })

})
//------------------------------------------------------------------------
// Add Contracts
//------------------------------------------------------------------------
app.post('/api/add_contracts', function(req,res){
   res.json({'msg': 'Contracts SAVED Successfully!'})
})
//------------------------------------------------------------------------
// Upload Schedule
//------------------------------------------------------------------------
app.post('/api/upload_schedule', upload.single("uploadfile"), (req, res) =>{
  filePath='./webApp/uploads/'+req.file.originalname
  scheduleType=req.body.scheduleType
  currentTime = (new Date().getTime()/1000 | 0)+(30*60)
  var x=0
  var y=0
  //clean tables
  db.run("DELETE FROM temp_"+scheduleType, (err,rows)=>{
  })

  xlsxFile(filePath).then((rows) => { 
    rows.shift();
      for (i in rows){
        timestamp = rows[i][0] // parseInt((new Date().getTime() / 1000).toFixed(0))
        // if(scheduleType.localeCompare("installments"==0))
        //   {
        //     timestamp = currentTime+(60*i*10) // rows[i][0] //1 minute
        //   }
        //   else
        //   {
        //     timestamp= currentTime+(60*6*i*10)// coupon every 6 minutes
        //   }

        Capital=parseInt((rows[i][2])*100).toFixed(0)
        Remun=parseInt((rows[i][3])*100).toFixed(0)
        Remb_Capital=parseInt((rows[i][4])*100).toFixed(0)
        try {
          db.run("INSERT INTO temp_"+scheduleType+"(Date, Id, Capital, Remun, Remb_Capital) values(?,?,?,?,?)", 
           timestamp, rows[i][1], Capital ,Remun, Remb_Capital, (err,rows)=>{
            if(err){            
        //handle the error 
            }
        })           
        } catch (error) {
          console.log("Error")
        }  
    }
    saveFile2DB(req.file.originalname, req.body.scheduleType,filePath)
    res.json({
      'msg': 'File uploaded successfully!', 'file': req.file.originalname
    });
}); 
             
});

//------------------------------------------------------------------------
// Broadcast coupons schedule in blockchain
//------------------------------------------------------------------------
app.post('/api/broadcast_coupons_schedule', async (req,res)=>{ 
  broadcaster.broadcastCoupon()
  res.json({
    'msg': 'Coupons are sent! WAIT CONFIRMATION ...'
  })  
})

//------------------------------------------------------------------------
// Broadcast installments schedule in blockchain
//------------------------------------------------------------------------
app.post('/api/broadcast_installments_schedule', (req,res)=>{
  broadcaster.broadcastInstallments()
  res.json({
    'msg': 'Installments are sent! WAIT CONFIRMATION ...'
  })  
})

//------------------------------------------------------------------------
// Trigger the Payment Schedule  
//------------------------------------------------------------------------
app.post('/api/trigger_schedule',(req,res)=>{
  try {
    // Call the schedular API 
    var request = unirest('POST', 'http://localhost:4000/api/schedules/start')
    .end(function (result) { 
      if (result.error)
      console.log("Error in trigger schedule")
      else
      {
        res.json({
          'msg': 'Payment trigger is fired ..'
        })  
      }
    });  
    
  } catch (error) {
    console.log(error)
  }
})

//------------------------------------------------------------------------
// Get Blockchain Events
//------------------------------------------------------------------------
app.get('/api/events', (req,res)=>{
  allEvents =[]
  murabahaContractInstance.getPastEvents('UpdateInstallmentEvent',{fromBlock: 4000,toBlock:'latest'}).then(function(murabahaEvents){
    murabahaEvents.forEach(event => {
      allEvents.push({"transactionHash":event.transactionHash, 
                      "blockNumber": event.blockNumber,
                      "returnValues":event.returnValues,
                      "type": "installment"
                    })
    });
   sukukContractInstance.getPastEvents('UpdateCouponEvent',{fromBlock: 4000,toBlock:'latest'}).then( function(sukukEvent){
    sukukEvent.forEach(event => {
      allEvents.push({"transactionHash":event.transactionHash, 
                      "blockNumber": event.blockNumber,
                      "returnValues":event.returnValues,
                      "type":"coupon"
                    })
    });
    
    res.send(
      allEvents.sort(function(a, b){
        return a.blockNumber - b.blockNumber;
    })
    )
   })

  })

  app.get('/api/accounts', (req, res)=>{
    accounts ={ 
      "SPV_collections" : SPVCollectionAccount,
      "investor_account": invertorAccount,
      "obligor_account": obligorAccount
    }
    res.send(accounts)
  })
})
//------------------------------------------------------------------------
// Refund SEPA transaction 
//------------------------------------------------------------------------
app.post('/api/payments/refundOrCancel', (req,res)=>{

    var reference = req.body.reference
    var value = req.body.value
    var paymentId =req.body.paymentId
    var installmentId=req.body.installmentId
    //WrYfvxnhjF*K<P]2K}334CS{H


    var req = unirest('POST', 'https://pal-test.adyen.com/pal/servlet/Payment/V52/cancelOrRefund')
    .headers({
        'Authorization': 'Basic d3NAQ29tcGFueS5UZXN0QWNjb3VudDc4MTpXcllmdnhuaGpGKks8UF0yS30zMzRDU3tI',
        'Content-Type': 'application/json',
    })
    .send(JSON.stringify({"merchantAccount":"TestAccount781ECOM","originalReference":reference}))
    .end( async function (response) { 
      
        if (response.error) throw new Error(response.error); 
        //update blockchain with new status   
        await murabahaContractInstance.methods.UpdateInstallment(installmentId,2,JSON.parse(response.raw_body).pspReference,(-value),"SEPA")
                    .send({from:ownerAddress, gas:208408})
                    .then(function(result){
                      res.send({'hash': result.transactionHash, "pspReference":JSON.parse(response.raw_body).pspReference, "response":JSON.parse(response.raw_body).response })
                    })
  });

})

//------------------------------------------------------------------------
// Load Data from database
//------------------------------------------------------------------------
app.get('/api/load_data', async (req,res)=>{
  let appData={}

  await db.all('SELECT * FROM counterparts ORDER BY Id DESC LIMIT 1', (err,rows)=>{
  appData['Id']=rows[0].Id
  appData['original_seller_name'] = rows[0].original_seller_name
  appData['original_seller_address'] = rows[0].original_seller_address
  appData['solo_investor_name'] = rows[0].solo_investor_name
  appData['solo_investor_address'] = rows[0].solo_investor_address
  appData['solo_investor_eth_address'] = rows[0].solo_investor_eth_address
  appData['solo_investor_payment_account_id'] = rows[0].solo_investor_payment_account_id
  appData['purchaser_name'] = rows[0].purchaser_name
  appData['purchaser_address'] = rows[0].purchaser_address
  appData['purchaser_eth_address'] = rows[0].purchaser_eth_address
  appData['purchaser_payment_account_id'] = rows[0].purchaser_payment_account_id
  })
 
  //We need to avoid the callback hell
  await db.all('SELECT name FROM file_uploads WHERE type="titleDead" ORDER BY id DESC LIMIT 1',(err,rows)=>{
    appData['titleDead']= rows[0].name
    db.all('SELECT name FROM file_uploads WHERE type="puaContract" ORDER BY id DESC LIMIT 1',(err,rows)=>{
      appData['puaContract']= rows[0].name
      db.all('SELECT name FROM file_uploads WHERE type="murabaAgreement" ORDER BY id DESC LIMIT 1',(err,rows)=>{
        appData['murabaAgreement']= rows[0].name
        db.all('SELECT name FROM file_uploads WHERE type="sukukCertificate" ORDER BY id DESC LIMIT 1',(err,rows)=>{
          appData['sukukCertificate']= rows[0].name
          db.all('SELECT name FROM file_uploads WHERE type="installments" ORDER BY id DESC LIMIT 1',(err,rows)=>{
            appData['installments']= rows[0].name
            db.all('SELECT name FROM file_uploads WHERE type="coupons" ORDER BY id DESC LIMIT 1',(err,rows)=>{
              appData['coupons']= rows[0].name
              db.all('SELECT name FROM file_uploads WHERE type="cxcKycDocument" ORDER BY id DESC LIMIT 1',(err,rows)=>{
                appData['cxcKycDocument']= rows[0].name
                db.all('SELECT name FROM file_uploads WHERE type="spvKycDocument" ORDER BY id DESC LIMIT 1',(err,rows)=>{
                  appData['spvKycDocument']= rows[0].name
                  db.all('SELECT name FROM file_uploads WHERE type="puvContract" ORDER BY id DESC LIMIT 1',(err,rows)=>{
                    appData['puvContract']= rows[0].name
                    res.json(appData)
                  })
                })
               })
             })
          })
        })

      })
    })
  } )
})

//------------------------------------------------------------------------
// Verification
//------------------------------------------------------------------------
app.get('/api/verification/files', (req,res)=>{
  db.all('SELECT Distinct type FROM file_uploads', (err,rows)=>{
  res.json(rows)
})
})

app.get('/api/verification/counterparts', (req,res)=>{
  db.all('SELECT  validation1A,validation1B,validation1C FROM counterparts ORDER by id DESC LIMIT 1', (err,rows)=>{
    res.json(rows)
  })
}) 

app.post('/api/verification/send2notary', async (req,res)=>{
  db.run('INSERT INTO notary (active, date) values(?,?)',1, new Date().toLocaleString(), (err,rows)=>{
          if(err){            
          console.log(err)
          res.sendStatus(404)
      }
      else
        res.sendStatus(200)
    })   
})
app.get('/api/notary/records', (req,res)=>{
  db.all('SELECT * FROM notary WHERE active=1 ORDER by id DESC LIMIT 1', (err,rows)=>{
    res.json(rows[0])
    
  })
})
app.post('/api/notary/update', (req,res)=>{
  console.log(req.body)
  var updatedField = req.body.updatedField
  console.log('Update ', updatedField)
  db.all('SELECT * FROM notary ORDER by id DESC LIMIT 1', (err,rows)=>{
    let sql = `UPDATE notary SET `+updatedField +` = ?  WHERE id = ?`;
    db.run(sql,1,rows[0].id, (err,rows)=>{
      res.sendStatus(200)
    })
  })
})

//------------------------------------------------------------------------
// SPV Collection Account
//------------------------------------------------------------------------
function AddRecordToSPVCollectionAccount(timestamp, value, transactionId,type)
{
  //value is positive for payin and negative for payout
  db.run('INSERT INTO spv_collection_account (timestamp, value, type, transaction_Id) VALUES(?,?,?,?)',
  timestamp, value, type,transactionId, (err,rows)=>{
    if (err)
    console.log(err)
  }
  )
}

//------------------------------------------------------------------------
// Deploy smart contracts
//------------------------------------------------------------------------
app.post('/api/contracts/deploy/sukuk', async (req,res)=>{ 

  await deployer.deploySukukSmartContract();
  res.json({
    'msg': 'Sukuk smart contract sent for deployment ...'
  })  
})

app.post('/api/contracts/deploy/murabaha', async (req,res)=>{ 
  await deployer.deployMurabahaSmartContract();
  res.json({
    'msg': 'Murabaha smart contracts is sent for deployment ...'
  })  
})

app.get('/api/contracts/status', (req,res)=>{
  db.all('SELECT * FROM notary ORDER by id DESC LIMIT 1', (err, rows)=>{
    res.json(rows[0])
  })
})

app.post('/api/contracts/reset', (req,res)=>{
  console.log('SOME ONE CALL REST ')
  // db.all('SELECT * FROM notary ORDER by id DESC LIMIT 1', (err,rows)=>{
  //   db.run('UPDATE notary SET active=0, coupon_broadcasted = 0, installment_broadcasted=0,'+
  //   'trigger_payment=0, sukuk_smart_contract=0, murabaha_smart_contract=0 WHERE id = ?',
  //   rows[0].id, (err, rows)=>{
  //     res.sendStatus(200)
  //     if(err) console.log(err)
  //   })
  // })
  //clean tables
  db.run("DELETE FROM notary", (err,rows)=>{
    db.run('UPDATE temp_coupons SET inBlockchain = NULL;' , (err,rows)=>{
      db.run('UPDATE temp_installments SET inBlockchain = NULL;', (err,rows)=>{
        res.sendStatus(200)
      })
    })
  })
  
  

})
//------------------------------------------------------------------------
app.listen(80, () => console.log('Web app listening at http://localhost:80'))
