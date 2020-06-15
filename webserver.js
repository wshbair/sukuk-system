const express = require('express');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const xlsxFile = require('read-excel-file/node');
const multer = require('multer');
var cors = require('cors')
var bodyParser = require('body-parser')
const Web3 = require('web3')
var Personal = require('web3-eth-personal');
const crypto = require('crypto');
// const cron = require("node-cron");
const reel = require('node-reel')
var compression = require('compression')

//***************************************************************
// Set your X-API-KEY with the API key from the Customer Area.
const {Client, Config, CheckoutAPI} = require('@adyen/api-library');
const config = new Config();
// Set your X-API-KEY with the API key from the Customer Area.
config.apiKey = 'AQEphmfuXNWTK0Qc+iSEl3cshueYR55DGcQSCdkB2pddm2UQjN6Cw2pXS+gQwV1bDb7kfNy1WIxIIkxgBw==-rjptUwQ3ILf9Ydhg9b5IrNwR9RHhzQuPRB3oXdFreqE=-Xk}Q945CB.gNbs2<';
config.merchantAccount = 'TestAccount781ECOM';
//***************************************************************


mockupBalances =[191655, 1000, 0,191655, 0,0, 200, 191655,191655]
mockupStatus =  [0, 0, 1,0, 1,1, 0, 0,0]


var SPVReserverAccount=0
var SPVCollectionAccount=0
var invertorAccount=0
var obligorAccount=30000000
var installmentCount=0
var installmentId=1
var couponId=1
var counter=0

global.__basedir = __dirname;
//const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/zGrJXk8tdDdrmZ6afes2"));
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
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

//Murabaha
var cxcMurabaha = require("./truffle/contracts/CXCMurabaha.json");
var murabahaContractAddr=Object.values(cxcMurabaha.networks)[0].address;
var murabahaContractInstance= new web3.eth.Contract(cxcMurabaha.abi,murabahaContractAddr);

//Sukuk 
var cxcSukuk = require("./truffle/contracts/CXCSukuk.json");
var sukukContractAddr=Object.values(cxcSukuk.networks)[0].address;
var sukukContractInstance= new web3.eth.Contract(cxcSukuk.abi,sukukContractAddr);

var ownerAddress=""
web3.eth.getAccounts().then( function(s){
  ownerAddress=s[0];
})

//--------------------------------------------------------------
// Main web pages
//--------------------------------------------------------------
app.get('/', (req, res) => res.sendFile(__dirname + '/webApp/index.html'))
app.get('/index.html', (req, res) => res.sendFile(__dirname + '/webApp/index.html'))
app.get('/sukuk.html', (req, res) => res.sendFile(__dirname + '/webApp/sukuk.html'))
app.get('/monitoring.html', (req,res)=> res.sendFile(__dirname + '/webApp/monitoring.html'))
app.get('/murabaha.html', (req,res)=> res.sendFile(__dirname + '/webApp/murabaha.html'))
app.get('/notary.html', (req,res)=> res.sendFile(__dirname + '/webApp/notary.html'))
app.get('/mandate.html', (req,res)=>res.sendFile(__dirname+'/webApp/mandate.html'))
app.get('/murabaha-manual-collection.html', (req,res)=>res.sendFile(__dirname+'/webApp/murabaha-manual-collection.html'))

//--------------------------------------------------------------
// Platform APIs
//--------------------------------------------------------------

//******************************************
// Murabha Contract
//******************************************

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
  value = req.body.value

  murabahaContractInstance.methods.UpdateInstallment(id,status,TxId,value)
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
  .then(function(len){
    if(len > 0)
    {
      for(i=1; i<=len; i++)
        {
          murabahaContractInstance.methods.installments(i).call()
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
          Payments.push({'id': record[0], 'timestamp':record[1], 'value':record[2], 'status':record[3], 'TxId':record[4]})
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
//******************************************
//Sukuk Contract
//******************************************
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
  .then(function(len){
    if(len > 0)
    {
      for(i=1; i<=len; i++)
        {
          sukukContractInstance.methods.coupons(i).call()
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

//******************************************
// Platform operation
//******************************************
app.get('/api/ethereum/address', function(req,res){
  web3.eth.personal.newAccount('!@superpassword'+ Math.random())
  .then(function(result){
    res.json(result)
  });
})
//------------------------------------------------------------------------
// Add Counterpart
//------------------------------------------------------------------------
app.post('/api/counterparts/add', function(req,res){
  var original_seller_name =  req.body.original_seller_name
	var original_seller_address = req.body.original_seller_address
	var solo_investor_name = req.body.solo_investor_name
	var solo_investor_address = req.body.solo_investor_address
	var solo_investor_mogopay_account = req.body.solo_investor_mogopay_account
	var solo_investor_eth_addr = req.body.solo_investor_eth_addr
  var purchaser_name = req.body.purchaser_name
	var purchaser_address = req.body.purchaser_address  
	var purchaser_mongopay_account = req.body.purchaser_mongopay_account
  var purchaser_EthAddr = req.body.purchaser_EthAddr

  
  db.run('INSERT INTO counterparts(original_seller_name, original_seller_address'+
         ',solo_investor_name,solo_investor_address,solo_investor_eth_address, solo_investor_mongopay_account_id,'+
         'purchaser_name,purchaser_address,purchaser_eth_address,purchaser_mongopay_account_id) values(?,?,?,?,?,?,?,?,?,?)', 
         original_seller_name,original_seller_address,
         solo_investor_name,solo_investor_address,solo_investor_eth_addr,solo_investor_mogopay_account,
         purchaser_name, purchaser_address, purchaser_mongopay_account,purchaser_EthAddr,
  (err,rows)=>{
    if(err)
    res.json({
      'msg': 'Error! : '+ err
    });
    else
    res.json({
      'msg': 'Counterparts Information SAVED Successfully!'
    });
  })

})
//------------------------------------------------------------------------
// Upload Schedule
//------------------------------------------------------------------------
app.post('/api/upload_schedule', upload.single("uploadfile"), (req, res) =>{
  filePath='./webApp/uploads/'+req.file.originalname
  scheduleType=req.body.scheduleType
  currentTime = (new Date().getTime()/1000 | 0)+(4*60)
  var x=0
  var y=0
  //clean tables
  db.run("DELETE FROM temp_"+scheduleType, (err,rows)=>{
  })

  xlsxFile(filePath).then((rows) => { 
    rows.shift();
      for (i in rows){
        //timestamp = parseInt((new Date(rows[i][0]).getTime() / 1000).toFixed(0))
        if(scheduleType.localeCompare("installments"==0))
          {
            timestamp = currentTime+(60*i) // rows[i][0] //1 minute
          }
          else
          {
            timestamp=currentTime+(60*6*i)// coupon every 6 minutes
          }

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
    res.json({
      'msg': 'File uploaded successfully!', 'file': req.file.originalname
    });
}); 
             
});

//------------------------------------------------------------------------
// Broadcast coupons schedule in blockchain
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

app.post('/api/broadcast_coupons_schedule', (req,res)=>{
  db.all('SELECT * FROM temp_coupons', (err,rows)=>{
     counter=0
    const forLoop = async _ => {
    
      for (let index = 0; index < 10; index++) {
        timestamp = parseInt(rows[index].Date)
        capital = parseInt(rows[index].Capital)
        reumn = parseInt(rows[index].Remun)
        rembCapital = parseInt(rows[index].Remb_Capital)

        await sukukContractInstance.methods.ScheduleCoupon(timestamp, capital, reumn, rembCapital)
        .send({from:ownerAddress, gas:208408})
        .on('confirmation', function(confirmationNumber, receipt)
        {
         // console.log('--> New coupon is registered', confirmationNumber)

         })
        .on('error', function(error){
          console.log(error)
        });

       }
    }
    forLoop().then(function(error,result){
      res.json({
        'msg': 'Coupons registration transactions are sent !'
      })
    })

  
   

  })
  

})

// Broadcast installments schedule in blockchain
app.post('/api/broadcast_installments_schedule', (req,res)=>{
  db.all('SELECT * FROM temp_installments', (err,rows)=>{
     counter=0
    const forLoop = async _ => {
     
      for (let index = 0; index < 60; index++) {
        timestamp = rows[index].Date
        capital = parseInt(rows[index].Capital)
        reumn = parseInt(rows[index].Remun)
        rembCapital = parseInt(rows[index].Remb_Capital)

        await murabahaContractInstance.methods.ScheduleInstallment(timestamp, capital, reumn, rembCapital)
        .send({from:ownerAddress, gas:208408})
        .on('confirmation', function(confirmationNumber, receipt)
        {
         })
        .on('error', function(error){
        })
       }
    }
    forLoop().then(function(error,result){
       res.json({
        'msg': 'Installments registration transaction are sent !'
      })
    })
  })
})

app.post('/api/trigger_schedule',(req,res)=>{
  TriggerSchedule()
  res.sendStatus(200)
})

function TriggerSchedule()
{
  reel().call(() => {
    console.log("::> Running a task every 1 minute");
    murabahaContractInstance.methods.installments(installmentId).call()
            .then(async function(installment){
              if(installment.id !=0 && installment.overallstatus.localeCompare("Success") !=0)
              {
              counter=counter+1
              console.log(" Counter: ", counter)  
              var monthlyPayment= parseInt(installment.reumn)+ parseInt(installment.rembCapital)
              obligorAccount=obligorAccount-mockupBalances[counter]
              SPVCollectionAccount= SPVCollectionAccount+mockupBalances[counter]
              console.log('--> Installment iD: ', installmentId)
              console.log('--> SPV Collection account: ', SPVCollectionAccount)
              console.log('--> Obligor Account: ', obligorAccount)
              console.log('===============================================')
              //update blockchain 
              await murabahaContractInstance.methods.UpdateInstallment(installment.id,mockupStatus[counter],'234',mockupBalances[counter])
              .send({from:ownerAddress, gas:208408})
              .then(function(res){
                installmentId=installmentId+1
  
                if(counter==6)
                  {
                    counter=0
                    sukukContractInstance.methods.coupons(couponId).call()
                      .then(function(coupon){
                        if(coupon.id != 0 && coupon.status.localeCompare("Success")!=0)
                          {
                            console.log('--> Coupon value: ', SPVCollectionAccount)
                            console.log('===============================================')
                            invertorAccount=SPVCollectionAccount+invertorAccount
                            sukukContractInstance.methods.UpdateCoupon(coupon.id,"Success","123",SPVCollectionAccount)
                            .send({from:ownerAddress, gas:208408})
                            .then(function(){
                              SPVCollectionAccount=0
                              couponId=couponId+1
                            })
                          }
                          else
                          couponId=couponId+1
                      })
                  }
              })
              
              }
              else
              installmentId=installmentId+1
          
            })
            
  }).everyMinute().run()
}

//******************************* */
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

//**********************************
//strip operation 


async function stripOperation() {
//   console.log('calling');
//   stripe.customers.create({
//     email: 'customer@example.com',
//   })
//     .then(customer => console.log(customer.id))
//     .catch(error => console.error(error));
// } id = cus_HIhwuni6g2Wt6M
const intent = await stripe.paymentIntents.create({
  amount: 1099,
  currency: 'eur',
  setup_future_usage: 'off_session',
  customer: 'cus_HIhwuni6g2Wt6M',
  payment_method_types: ['sepa_debit'],
  // Verify your integration in this guide by including this parameter
  metadata: {integration_check: 'sepa_debit_accept_a_payment'},

})}


//stripOperation()
// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
// app.post("/webhook", async (req, res) => {
//   let data, eventType;

//   // Check if webhook signing is configured.
//   if (process.env.STRIPE_WEBHOOK_SECRET) {
//     // Retrieve the event by verifying the signature using the raw body and secret.
//     let event;
//     let signature = req.headers["stripe-signature"];
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.rawBody,
//         signature,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.log(`⚠️  Webhook signature verification failed.`);
//       return res.sendStatus(400);
//     }
//     data = event.data;
//     eventType = event.type;
//   } else {
//     // Webhook signing is recommended, but if the secret is not configured in `config.js`,
//     // we can retrieve the event data directly from the request body.
//     data = req.body.data;
//     eventType = req.body.type;
//   }

//   if (eventType === "payment_intent.succeeded") {
//     // Funds have been captured
//     // Fulfill any orders, e-mail receipts, etc
//     // To cancel the payment you will need to issue a Refund (https://stripe.com/docs/api/refunds)
//     console.log("💰 Payment received!");
//   } else if (eventType === "payment_intent.payment_failed") {
//     console.log("❌ Payment failed.");
//   }
//   res.sendStatus(200);
// });


// const client = new Client({ config });
// client.setEnvironment("TEST");

// const checkout = new CheckoutAPI(client);
// checkout.payments({
//     amount: { currency: "EUR", value: 1000 },
//     paymentMethod: {
//         type: 'sepadirectdebit',
//         ownerName: 'A. Schneider',
//         iban: 'DE87123456781234567890'
//     },
//     reference: "YOUR_ORDER_NUMBER",
//     merchantAccount: config.merchantAccount
// }).then(function(res){
//     console.log(res)
// })
// .catch((err)=>{
//     console.log(err)
//   })



app.listen(3000, () => console.log('Web app listening at http://localhost:3000'))


