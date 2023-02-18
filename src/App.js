import React, { useEffect, useState }  from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import {ethers} from "ethers";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.alfa';
const CONTRACT_ADDRESS = '0x124920B1f42AD4929A93058C91a66259305fAacf';

const App = () => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState('');

    const renderNotConnectedContainer = () => (
	<div className="connect-wallet-container">
	    <img src="https://media.giphy.com/media/3b6rU7cb6g8zykC5uN/giphy.gif" alt="gif"/>
	    <button onClick={connectWallet} className="cta-button connect-wallet-button">
		Connect Wallet
	    </button>
	</div>
    );

    const renderInputForm = () => {
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
		    <button className='cta-button mint-button' disabled={null} onClick={null}>
			Mint
		    </button>  
		    <button className='cta-button mint-button' disabled={null} onClick={null}>
			Set data
		    </button>  
		</div>

	    </div>	    
	);
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
