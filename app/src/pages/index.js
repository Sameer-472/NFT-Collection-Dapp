import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useState, useEffect, useRef } from "react";
import { Contract, providers, utils } from "ethers";
import Web3Modal from "web3modal";
import { abi, contractAddress } from "@/constant";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [preSaleStarted, setPreSaleStarted] = useState(false);
  const [preSaleEnded, setPreSaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setisOwner] = useState(false);
  const [TokenIdsMinted, setTokenIdsMinted] = useState("0");

  const web3ModalRef = useRef();

  const getProviderorSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      // throw new Error("Change network to Goerli");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const preSaleMint = async () => {
    try {
      const signer = await getProviderorSigner(true);
      const nftContract = new Contract(contractAddress, abi, signer);
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      alert("You successfully minted a Crypto Dev!");
      getTokenIdsMinted();
    } catch (error) {
      console.log(error);
    }
  };

  const publicMint = async () => {
    try {
      const signer = await getProviderorSigner(true);
      const nftContract = new Contract(contractAddress, abi, signer);
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      alert("You successfully minted a Crypto Dev!");
      setlink(true);
      getTokenIdsMinted();
    } catch (error) {
      console.log(error);
    }
  };

  const startPreSale = async () => {
    try {
      const signer = await getProviderorSigner(true);
      // console.log(signer);
      const nftContract = new Contract(contractAddress, abi, signer);
      console.log(nftContract);
      const tx = await nftContract.startPreSale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfPreSaleStarted = async () => {
    try {
      const provider = await getProviderorSigner();
      const nftContract = new Contract(contractAddress, abi, provider);
      const _presaleStarted = await nftContract.presaleStarted();
      console.log("if it is true presale has started", _presaleStarted);
      if (!preSaleStarted) {
        await getOwner();
      }
      setPreSaleStarted(_presaleStarted);
    } catch (error) {
      console.log(error);
    }
  };

  const getOwner = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderorSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(contractAddress, abi, provider);
      // call the owner function from the contract
      const _owner = await nftContract.owner();
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderorSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setisOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const checkIfPreSaleEnded = async () => {
    try {
      const provider = await getProviderorSigner();
      const nftcontract = new Contract(contractAddress, abi, provider);
      const _preSaleEnded = await nftcontract.presaleEnded();
      console.log(_preSaleEnded);
      const hashEnded = _preSaleEnded.lt(Math.floor(Date.now() / 1000));
      console.log(hashEnded);
      if (hashEnded) {
        setPreSaleEnded(true);
      } else {
        setPreSaleEnded(false);
      }
      return hashEnded;
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderorSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(contractAddress, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      console.log(_tokenIds);
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      const result = await getProviderorSigner(true);
      console.log(result);
      setWalletConnected(true);
      getOwner();
      const _presaleStarted = checkIfPreSaleStarted();
      if (_presaleStarted) {
        checkIfPreSaleEnded();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      // connectWallet();

      // const _presaleStarted = checkIfPreSaleStarted();
      // if(_presaleStarted){
      //   checkIfPreSaleEnded();
      // }
      // await getTokenIdsMinted();

      // const presaleEndedInterval = setInterval(async function () {
      //   const _presaleStarted = await checkIfPreSaleStarted();
      //   if (_presaleStarted) {
      //     const _presaleEnded = await checkIfPreSaleEnded();
      //     if (_presaleEnded) {
      //       clearInterval(presaleEndedInterval);
      //     }
      //   }
      // }, 5 * 1000);

      // setInterval(async function () {
      //   await getTokenIdsMinted();
      // }, 5 * 1000);
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
    if (isOwner && !preSaleStarted) {
      return (
        <button className={styles.button} onClick={startPreSale}>
          Start Presale!
        </button>
      );
    }
    if (!preSaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasn&#39;t started!</div>
          {/* <div className={styles.description}>Presale hasn&#39;t started!</div> */}
          <div className={styles.description}>Presale hasn't started!</div>
        </div>
      );
    }
    if (preSaleStarted && !preSaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={preSaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }
    if (preSaleStarted && preSaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <>
      <div>
        <Head>
          <title>Crypto Dev</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
            <div className={styles.description}>
              {/* It&#39;s an NFT collection for developers in Crypto. */}
              It's an NFT collection for developers in Crypto.
            </div>
            <div className={styles.openSea}>
              <a target="_blank" href="https://testnets.opensea.io/assets/goerli/0x6e986e04f35014043de14b24f6d951eead9ef588">Check Crypto dev Collection on OpenSea.io...</a>
            </div>
            <div className={styles.description}>
              {TokenIdsMinted}/20 have been minted
            </div>
            {renderButton()} <br />
            
          </div>
          <div>
            {/* <img className={styles.image} src="./cryptodevs/0.svg" /> */}
          </div>
        </div>

        <footer className={styles.footer}>Made with &#10084; by Sameer</footer>
      </div>
    </>
  );
}
