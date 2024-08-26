import React, { useState, useEffect } from "react";
import "./App.css";
import "./CoinFlip.css";
import { ethers } from "ethers";
import artifact from "./CoinFlipABI.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const coinFlipContract = new ethers.Contract(
  contractAddress,
  artifact.abi,
  signer
);

function App() {
  const [account, setAccount] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [guess, setGuess] = useState(true);
  const [result, setResult] = useState(null);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (coinFlipContract) {
      const handleCoinFlipped = (player, guessedSide, outcome, amountWon) => {
        console.log("Event received:", { player, guessedSide, outcome, amountWon });
        if (player.toLowerCase() === account.toLowerCase()) {
          setResult(
            `You guessed ${guessedSide ? 'Heads' : 'Tails'} and ${
              outcome ? 'won' : 'lost'
            }. Amount won: ${ethers.utils.formatEther(amountWon)} ETH`
          );
        }
      };

      console.log("Adding event listener for CoinFlipped");
      coinFlipContract.on("CoinFlipped", handleCoinFlipped);

      // Cleanup event listener on component unmount
      return () => {
        console.log("Removing event listener for CoinFlipped");
        coinFlipContract.off("CoinFlipped", handleCoinFlipped);
      };
    }
  }, [coinFlipContract, account]);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const flipCoin = async () => {
    if (!betAmount || betAmount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }
  
    try {
      setFlipping(true);
      setTimeout(() => setFlipping(false), 2000);
  
      const tx = await coinFlipContract.flip(guess, {
        value: ethers.utils.parseEther(betAmount),
      });
      console.log("Transaction sent:", tx);
      await tx.wait(); // Wait for the transaction to be mined
      console.log("Transaction mined");
  
    } catch (error) {
      console.error("Error flipping coin:", error);
    }
  };
  

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <button className="button" onClick={connectWallet}>
            {account ? `Connected: ${account}` : "Connect Wallet"}
          </button>
          {account && (
            <div>
              <div className="coin" onClick={flipCoin}>
                <div className={`coin-face heads ${flipping ? 'flipping' : ''}`}></div>
                <div className={`coin-face tails ${flipping ? 'flipping' : ''}`}></div>
              </div>
              <div className="button-container">
                <button className="button" onClick={() => setGuess(true)}>Guess Heads</button>
                <button className="button" onClick={() => setGuess(false)}>Guess Tails</button>
              </div>
              <input
                className="bet-input"
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Bet Amount (ETH)"
              />
              <button className="button flip-coin-button" onClick={flipCoin}>Flip Coin</button>
              {result && <p>{result}</p>} 
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
