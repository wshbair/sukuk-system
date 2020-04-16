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




async function deploySContr(bytecode, abi, _monthlyPaymentValue, _monthsToPay, _yearPayFirst,
            _periodPayFirst, _addrSpv) {

    /*
    // Compilation
    const output = solc.compile(input.toString(), 1);
    const bytecode = output.contracts[':vnxAuctionSC'].bytecode;
    const abi = JSON.parse(output.contracts[':vnxAuctionSC'].interface);
    
    const bytecode = fs.readFileSync('./auction/bid.bin');
    */
    //const abi = JSON.parse(fs.readFileSync('./auction/bid.abi'));

    
    //Deployment
    var MyContract = web3.eth.contract(abi);
    var contractInstance = null;
    contractInstance = await MyContract.new(
            _monthlyPaymentValue, _monthsToPay, _yearPayFirst,
            _periodPayFirst, _addrSpv,
            {data: '0x'+bytecode, from:  web3.eth.accounts[0], gas: 4700000});

    var tx_receipt =null;
    var blocknumber=null;

    // Wait the contract to be mined
    console.log("> Wait the contract to be mined ...")
    while(! blocknumber)
    {
        tx_receipt = web3.eth.getTransaction(contractInstance.transactionHash)
        blocknumber = tx_receipt.blockNumber
    }
    tx_receipt = web3.eth.getTransactionReceipt(contractInstance.transactionHash)
    console.log("> Contract address: " + tx_receipt.contractAddress + "\n")
    return tx_receipt.contractAddress;
}

/*
    returns:
         0 -- success
         1 -- error with event 
*/
async function addInstallment( brs, _year, _period, _day, _val ) {

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
        let transVal = result.args._value / 100;
        console.log("> Added instalmwent = "+ transVal.toString() 
                    + " for " + _year.toString()+"/"+_period.toString());
    } )

    return 0;
}

/*
    returns:
         0 -- success
         1 -- error with event 
*/
async function addSpvTransfer( brs, _year, _period, _day ) {

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
        fromBlock: web3.eth.blockNumber, toBlock: 'latest'});0
    let resSpv = await eveSpv.watch(function(err, result) {
        if (err) {
            console.log(err)
            return 1;
        }
        let transVal = result.args._value / 100;
        console.log("> Added SpvTransfer = "+ transVal.toString() 
                    + " for " + _year.toString()+"/"+_period.toString());
    } )

    return 0;
}

/*
    returns:
         0 -- success
         1 -- error with event 
*/
async function printCurrentStatus( brs, _year, _period ) {

    var resBalance = await brs.getTotalBalance();
    if( resBalance[1] > 0 ) {
        console.log("> Error in Total Balance = "+ resBalance[1].toString());
    } else {
        console.log("> Total Balance = "+ resBalance[0].toString());
    }
    
    var resArrears = await brs.getTotalArrears( _year, _period);
    if( resArrears[1] > 0 ) {
        console.log("> Error in Total Arrears = "+ resArrears[1].toString());        
    } else {
        console.log("> Total Arrears = "+ resArrears[0].toString());
    }

}


async function main() {

    console.clear();
    console.log(web3.eth.blockNumber);


    console.log("DEBUG: starting...");

    //web3.personal.unlockAccount(web3.eth.accounts[1], 'ira');

    // 0xc4df27466183c0fe2a5924d6ea56e334deff146a
    var contractAddress='0xc4df27466183c0fe2a5924d6ea56e334deff146a'; //-- garnash // '0xe790e797f1ad70c2e9382228ab4e621e86f14816';

    //const bytecodeUSD = fs.readFileSync('./binusd/CryptoUSD.bin');
    //const abiUSD = JSON.parse(fs.readFileSync('./binusd/CryptoUSD.abi'));
    //var usdAddress = await deploySContr(bytecodeUSD, abiUSD, '');
    //console.log("> Starting using USD address: " + usdAddress + "\n")
    
    const bytecode = fs.readFileSync('./binout/Murabaha.bin');
    const abi = JSON.parse(fs.readFileSync('./binout/Murabaha.abi'));

    var _monthlyPaymentValue=2000 * 100 // in cents
    var _monthsToPay= 12 * 10 // 10 years
    var _yearPayFirst = 2019
    var _periodPayFirst = 5
    var _addrSpv = 0x0
    console.log("DEBUG: contract.at is completed");

    var contractAddress = await deploySContr(bytecode, abi, 
            _monthlyPaymentValue, _monthsToPay, _yearPayFirst, _periodPayFirst, _addrSpv);
    console.log("> Starting using contract address: " + contractAddress + "\n")
    
    const ioContract = web3.eth.contract(abi); // Contract object
    var brs = ioContract.at(contractAddress);
    console.log("DEBUG: contract.at is completed");

    /*
    var _year = 2019
    var _period = 5 
    var _day = 5
    var _val = 2000 * 100
    var err = await addInstallment( brs, _year, _period, _day, _val );
    if( err!=0 ){
        console.log("Exiting, error in addInstalment");
        exit(1);
    }
    //await printCurrentStatus(brs, _year, _period);

    var err = await addSpvTransfer( brs, _year, _period, _day );
    if( err!=0 ){
        console.log("Exiting, error in addSpvTransfer");
    }

    var _year = 2019
    var _period = 6 
    var _day = 5
    var _val = 1500 * 100
    var err = await addInstallment( brs, _year, _period, _day, _val );
    if( err!=0 ){
        console.log("Exiting, error in addInstalment");
    }

    var err = await addSpvTransfer( brs, _year, _period, _day );
    if( err!=0 ){
        console.log("Exiting, error in addSpvTransfer");
    }

    var _year = 2019
    var _period = 7 
    var _day = 5
    var _val = 3000 * 100
    var err = await addInstallment( brs, _year, _period, _day, _val );
    if( err!=0 ){
        console.log("Exiting, error in addInstalment");
    }

    var err = await addSpvTransfer( brs, _year, _period, _day );
    if( err!=0 ){
        console.log("Exiting, error in addSpvTransfer");
    }
    */

    return brs;

}

async function readPayment(brs) {

    var res = brs.getPeriodTotalPayment( 2019, 7 );
    console.log("> Results of the getPeriodTotalPayment: ") 
    console.log(res);
    return 0;
}




main().then( (brs) => {
    //wait readPayment( brs );
    console.log('Issue program complete.');
    printCurrentStatus(brs, 2019, 8);

}).catch((e) => {

    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
