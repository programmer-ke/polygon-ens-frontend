import React, { useEffect, useState }  from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import {ethers} from "ethers";
import contractABI from './utils/Domains.json';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.alfa';
const CONTRACT_ADDRESS = '0xf61caB99C0AAc8A130af112127642c48c55e32AF';
const POLYGONSCAN_URL = 'https://mumbai.polygonscan.com/tx/';

const App = () => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState('');
    const [network, setNetwork] = useState('');

    const renderNotConnectedContainer = () => (
	<div className="connect-wallet-container">
	    <img src="https://media.giphy.com/media/3b6rU7cb6g8zykC5uN/giphy.gif" alt="gif"/>
	    <button onClick={connectWallet} className="cta-button connect-wallet-button">
		Connect Wallet
	    </button>
	</div>
    );

    const renderInputForm = () => {
	if (network !== "Polygon Mumbai Testnet") {
	    return (
		<div className="connect-wallet-container">
		    <p>Please connect to the Mumbai Network</p>
		    <button className="cta-button mint-button" onClick={switchNetwork}>Click here to switch</button>
		</div>
	    );
	}
	return (
	    <div className="form-container">
		<div className="first-row">
		    <input
			type="text"
			value={domain}
			placeholder='domain'
			onChange={e => setDomain(e.target.value)}
		    />
		    <p className='tld'> {tld} </p>
		</div>

		<input
		    type="text"
		    value={record}
		    placeholder='make your alfa statement'
		    onChange={e => setRecord(e.target.value)}
		/>

		<div className="button-container">
		    <button className='cta-button mint-button' disabled={null} onClick={mintDomain}>
			Mint
		    </button>  
		    <button className='cta-button mint-button' disabled={null} onClick={null}>
			Set data
		    </button>  
		</div>

	    </div>	    
	);
    };

    const switchNetwork = async () => {
	if (!window.ethereum) {
	    alert("Please install metamask");
	    return;
	}

	try {
	    await window.ethereum.request({
		method: "wallet_switchEthereumChain",
		params: [{ chainId: '0x13881' }],
	    });
	} catch (error) {
	    // In this case, the chain has not been added to metamask.
	    // We ask the user to add it
	    if (error.code === 4902) {
		try {
		    await window.ethereum.request({
			method: 'wallet_addEthereumChain',
			params: [
			    {	
				chainId: '0x13881',
				chainName: 'Polygon Mumbai Testnet',
				rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
				nativeCurrency: {
				    name: "Mumbai Matic",
				    symbol: "MATIC",
				    decimals: 18
				},
				blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
			    },
			],
		    });
		} catch (error) {
		    console.log(error);
		}
	    } else {
		console.log(error);
	    }
	}
    };
    const mintDomain = async () => {
	// domain state variable should have a value
	if (!domain) return;

	const price = domain.length <= 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
	console.log("minting domain", domain, "with price", price);

	try {
	    
	    const { ethereum } = window;
	    if (!ethereum) return; // do nothing if we don't have access to wallet

	    const provider = new ethers.providers.Web3Provider(ethereum);
	    const signer = provider.getSigner();
	    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
	    
	    let txn = await contract.register(domain, {value: ethers.utils.parseEther(price)});

	    // wait for transaction be mined
	    const receipt = await txn.wait();

	    if (receipt.status === 1) {
		console.log("Domain minted at", POLYGONSCAN_URL + txn.hash);

		// set the record for the domain
		txn = await contract.setRecord(domain, record);
		await txn.wait();

		console.log("Record set at", POLYGONSCAN_URL + txn.hash);

		// reset component state  variables
		setRecord('');
		setDomain('');
	    } else {
		alert("Transaction failed! Try again");
	    }
	    
	} catch (error) {
	    console.log(error);
	}
	
    };

    const connectWallet = async () => {
	try {
	    const { ethereum } = window;
	    if (!ethereum) {
		alert("Please install a wallet (metamask)");
		return;
	    }

	    // request access to wallet account
	    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
	    console.log("Connected account", accounts[0]);
	    setCurrentAccount(accounts[0]);

	} catch (error) {
	    console.log(error);
	}
    };

    const checkIfWalletIsConnected = async () => {
	const { ethereum } = window;
	if (!ethereum) {
	    console.log("Make sure you have metamask");
	    return;
	} else {
	    console.log("We have the ethereum object");
	}

	// Get any authorized accounts
	const accounts = await ethereum.request({ method: "eth_accounts" });
	if (accounts.length > 0) {
	    const account = accounts[0];
	    console.log("Found authorized account:", account);
	    setCurrentAccount(account);
	} else {
	    console.log("No authorized account found");
	}

	const chainId = await ethereum.request({ method: 'eth_chainId'});
	setNetwork(networks[chainId]);

	ethereum.on('chainChanged', handleChainChanged);

	// Reload page when network is changed
	function handleChainChanged(_chainId) {
	    window.location.reload();
	}

    };

    useEffect(() => {
	checkIfWalletIsConnected();
    }, []);

    return (
	<div className="App">
	    <div className="container">

		<div className="header-container">
		    <header>
			<div className="left">
			    <p className="title">🐱‍👤 Alfa Name Service</p>
			    <p className="subtitle">Your immortal API on the blockchain!</p>
			</div>
			{/* Display a logo and wallet connection status*/}
			<div className="right">
			    <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
			    { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
			</div>
		    </header>
		</div>

		{/* Render connect wallet or input form */}
		{!currentAccount && renderNotConnectedContainer()}
		{currentAccount && renderInputForm()}

		<div className="footer-container">
		    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
		    <a
			className="footer-text"
			href={TWITTER_LINK}
			target="_blank"
			rel="noreferrer"
		    >{`built with @${TWITTER_HANDLE}`}</a>
		</div>
	    </div>
	</div>
    );
};

export default App;
