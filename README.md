
#  Tokenized Mortgage Sukuk

This project is intended to tokenize mortgage sukuk via blockchain technology. The main users of the process are solo investor, notary and SPV. The SPV setup as the originator of the mortgage, it buys and sells the CRE with the funding from the Sole Investor.

![Home page](https://github.com/wshbair/sukuk-system/blob/master/home.jpeg)

## Getting Started

The sytem has two nodejs service, the first is the core service managing the whole life cycle of the system and serve the user interface. The second service is the scheduler that will feed the cron-scheduler with the records retrived from blockchain.

### Smart Contracts Compile

```
cd truffle
```

```
npm install
```


```
truffle compile 
```


```
truffle migrate --reset
```

## Built With

* [NodeJS](http://www.dropwizard.io/1.0.2/docs/) - Used to Backend development
* [Web3](http://www.dropwizard.io/1.0.2/docs/) - Interaction with Ethrereum blockchain 
* [Ethrereum](https://maven.apache.org/) - Used as blockchain platform
* [Solidity](https://solidity.readthedocs.io/en/v0.4.24/introduction-to-smart-contracts.html) - Used for smart contracts coding
* [Truffle Suite](https://www.trufflesuite.com/) - Used for smart contracts development and unit testing 
* [Infura](https://infura.io/dashboard) - Used for accessing Ethereum blockchain 


## Authors

* **Wazen Shbair** 
* **Alex Yakubov**  
* **Taha Lahbabi**  

## License

TBD
