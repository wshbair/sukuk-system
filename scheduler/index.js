'use strict';

var schedule = require('node-schedule');
var cxcScheduler = require('./cxcSchedular')
const express = require('express');
var unirest = require('unirest');
//--------------------------------------------------------------
// Express server configuration
//--------------------------------------------------------------
const app = express();

async function LoadSchedulesFromBlockchain()
{
  try {
    //Get installments from blockchain  
  await unirest('GET', 'http://localhost:3000/api/installment/all')
  .end(function (res) { 
    if (res.error) 
      console.log('[Schedular] error ', res.error) //throw new Error(res.error); 
    else
    {
      var installments = JSON.parse(res.raw_body)
      Object.keys(installments).forEach(function(k){
      cxcScheduler.scheduleInstallment(installments[k].timestamp,installments[k].id)
      //console.log("installment: ", installments[k].timestamp)
  });
    console.log('[Schedular] all installments are scheduled')
    }
  //Get Coupons 
  unirest('GET', 'http://localhost:3000/api/coupon/all')
  .end(function (res) { 
    if (res.error)
      console.log('[Schedular] error ', res.error) //throw new Error(res.error); 
       else
       {
        var coupons = JSON.parse(res.raw_body)
        Object.keys(coupons).forEach(function(k){
          cxcScheduler.scheduleCoupon(coupons[k].timestamp,coupons[k].id)
       });
       console.log('[Schedular] all coupons are scheduled')

       }
  });

  });
    
  } catch (error) {
    console.log('[Schedular] error ', error)
   }
  
}

app.post('/api/schedules/start', async (req,res)=>{
  try {
    //reset schedular
    await cxcScheduler.resetSchedular()
    //Reload fresh one
    await LoadSchedulesFromBlockchain()
    res.sendStatus(200)
    } catch (error) {
      res.sendStatus(500)
    }
  
})

app.post('/api/schedules/reset', async (req,res)=>{
  await cxcScheduler.resetSchedular()
})

app.listen(4000, async function () {
  console.log("[Schedular] listening at http://localhost:4000");
  //reload the schedules in case of crash
  try {
    LoadSchedulesFromBlockchain()  
  } catch (error) {
    console.log("[Schedular] error", error)
  }

  });