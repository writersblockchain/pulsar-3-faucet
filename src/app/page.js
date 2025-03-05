"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [canRequest, setCanRequest] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check rate limit on component mount
  useEffect(() => {
    const lastRequest = localStorage.getItem('lastTokenRequest');
    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
      const hoursSinceLastRequest = timeSinceLastRequest / (1000 * 60 * 60);
      setCanRequest(hoursSinceLastRequest >= 24);
    }
  }, []);

  const sendTokens = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setMessage("Processing...");
    setTxHash(null); // Reset previous txHash

    try {
      const response = await fetch("/api/sendTokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Transaction successful! Check your wallet.");
        setTxHash(data.txHash); // Save txHash to display on screen
        localStorage.setItem('lastTokenRequest', Date.now().toString());
        setCanRequest(false);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Request failed. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-tan p-6">
      <motion.h1
        className="text-5xl font-extrabold text-brand-orange mb-6 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Secret Network Pulsar-3 Faucet
      </motion.h1>

      <motion.div
        className="w-full max-w-lg bg-white border-2 border-brand-orange rounded-3xl shadow-2xl p-6 space-y-5"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.input
          className="w-full p-3 border border-brand-blue rounded-xl text-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
          placeholder="Enter your wallet address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          spellCheck="false"
          disabled={!canRequest || isProcessing}
        />
        <motion.button
          className={`w-full py-3 text-white font-semibold text-lg rounded-xl transform hover:scale-105 ${
            canRequest && !isProcessing ? 'bg-brand-orange' : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={sendTokens}
          disabled={!canRequest || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Request Funds'}
        </motion.button>

        {!canRequest && (
          <motion.p className="text-center text-brand-blue font-medium text-sm">
            You can only request funds once every 24 hours. Please wait until{" "}
            {new Date(parseInt(localStorage.getItem('lastTokenRequest')) + 24 * 60 * 60 * 1000).toLocaleString()}
          </motion.p>
        )}

        {message && (
          <motion.p className="text-center text-brand-blue font-medium text-base">
            {message}
          </motion.p>
        )}

        {txHash && (
          <motion.p
            className="text-center text-brand-blue font-medium text-sm bg-gray-100 p-3 rounded-xl border border-gray-300 overflow-hidden truncate w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Transaction Hash:{" "}
            <a
              href={`https://secretnodes.com/pulsar/transactions/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-orange font-bold underline"
            >
              {txHash}
            </a>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
