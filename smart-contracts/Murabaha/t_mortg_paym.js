'use strict';

/* 
Performance results:
gas = 4 mln out of max 4.7 mln
OmitIntegrityCheck = true
    30 -> OK
    50 -> does not work (ASSERT throws exception, brobably due to insufficient gas)
*/


var Web3 = require('web3');
const fs = require('fs');
//const solc = require('solc');

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8084"));
//const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

const PromisifyWeb3 = require("./promisifyWeb3.js");
PromisifyWeb3.promisify(web3);


var contractAddress = process.argv[2];  //'0xf23276778860e420acfc18ebeebf7e829b06965c'; 
var gYear = parseInt(process.argv[3]);
var gPeriod = parseInt(process.argv[4]); 
var gValue = parseInt(process.argv[5]); 
var gIsSpv = false //= process.argv[5];

//set default value if the parameters not given in the command
if( process.argv.length == 7 && process.argv[6].toUpperCase() === "SPV" ) {
    console.log("> Transfering to SPV...")
    gIsSpv = true
}

console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
console.log("  Loading to Murabaha ")
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
console.log("> Contract address: "+ contractAddress)
console.log("> Year: "+ gYear.toString()+", Period: "+gPeriod.toString()+", Value: "+gValue.toString())


async function main() {

    //console.clear();
    console.log(web3.eth.blockNumber);


    console.log("DEBUG: starting...");

    //web3.personal.unlockAccount(web3.eth.accounts[1], 'ira');

    //var contractAddress='0xf23276778860e420acfc18ebeebf7e829b06965c'; 
    console.log("> Starting using contract address: " + contractAddress + "\n")

    const bytecode = fs.readFileSync('./binout/Murabaha.bin');
    const abi = JSON.parse(fs.readFileSync('./binout/Murabaha.abi'));

    const ioContract = web3.eth.contract(abi); // Contract object
    var brs = ioContract.at(contractAddress);
    console.log("DEBUG: contract.at is completed");

    var _year = gYear
    var _period = gPeriod
    var _day = 15
    var _val = gValue*100;

    if(gIsSpv === false) {
        let addInstal = await brs.addInstallment.sendTransaction( _year, _period, _day, _val,
            { from: web3.eth.accounts[0], gas: 4000000 },
            function(e, result) {
                if (!e) {
                    console.log('Add Instalment OK'
                        + " for " + _year.toString()+"/"+_period.toString()); //  + result.args._ret
                } else {
                    console.log(e);
                }
            }
        )
        var eveInstal = await brs.evPaymentAdded({_sender: web3.eth.accounts[0]},
            {filter: {_year: _year, _period: _period, _day: _day}, 
            fromBlock: web3.eth.blockNumber, toBlock: 'latest'});
        let resInstal = await eveInstal.watch(function(err, result) {
            if (err) {
                console.log(err)
                return 1;
            }
            let transVal = result.args._value/100 ;
            let transInd = result.args._newInd;
            let transErr = result.args._errCode;
            console.log("> Added instalmwent, val="+ transVal.toString()
                        + ", ind=" + transInd.toString() + ", err=" + transErr.toString()
                        + " for " + _year.toString()+"/"+_period.toString());
        } )
    
    } else {
        let addSpv = await brs.transferMonthlyToSPV.sendTransaction( _year, _period, _day, 
            { from: web3.eth.accounts[0], gas: 4000000 },
            function(e, result) {
                if (!e) {
                    console.log('Add SpvTransfer OK'
                           + " for " + _year.toString()+"/"+_period.toString()); //  + result.args._ret
                } else {
                    console.log(e);
                }
            }
        )
        var eveSpv = await brs.evPaymentAdded({_sender: web3.eth.accounts[0]},
            {filter: {_year: _year, _period: _period, _day: _day}, 
            fromBlock: web3.eth.blockNumber, toBlock: 'latest'});
        let resSpv = await eveSpv.watch(function(err, result) {
            if (err) {
                console.log(err)
                return 1;
            }
            let transVal = result.args._value/100 ;
            let transInd = result.args._newInd;
            let transErr = result.args._errCode;
            console.log("> Added SpvTransfer = "+ transVal.toString() 
                            + ", ind=" + transInd.toString() + ", err=" + transErr.toString()
                            + " for " + _year.toString()+"/"+_period.toString());
        } )
    
    }


    return brs;

}

async function readPayment(brs) {

    var res = brs.getPeriodTotalPayment( 2019, 7 );
    console.log("> Results of the getPeriodTotalPayment: ") 
    console.log(res);
    return 0;
}




main().then( (brs) => {
    console.log('Issue program complete.');

}).catch((e) => {

    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
