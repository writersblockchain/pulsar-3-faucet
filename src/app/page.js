"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [canRequest, setCanRequest] = useState(true);
  const recaptchaRef = useRef(null);

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
    if (!canRequest) {
      const lastRequest = localStorage.getItem('lastTokenRequest');
      const nextRequestTime = new Date(parseInt(lastRequest) + 24 * 60 * 60 * 1000);
      setMessage(`Please wait until ${nextRequestTime.toLocaleString()} before requesting again.`);
      return;
    }

    const captchaToken = window.grecaptcha.getResponse();
    if (!captchaToken) {
      setMessage("Please complete the CAPTCHA verification.");
      return;
    }

    setMessage("Processing...");
    setTxHash(null); // Reset previous txHash

    try {
      const response = await fetch("/api/sendTokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          walletAddress,
          captchaToken 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Transaction successful! Check your wallet.");
        setTxHash(data.txHash); // Save txHash to display on screen
        localStorage.setItem('lastTokenRequest', Date.now().toString());
        setCanRequest(false);
        window.grecaptcha.reset(); // Reset the CAPTCHA after successful request
      } else {
        setMessage(`Error: ${data.error}`);
        window.grecaptcha.reset(); // Reset the CAPTCHA on error
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setMessage("Request failed. Try again.");
      window.grecaptcha.reset(); // Reset the CAPTCHA on error
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
          disabled={!canRequest}
        />
        <div className="flex justify-center">
          <div
            className="g-recaptcha"
            data-sitekey="6LcmuOoqAAAAAJZr_A1TtihiCnJu0n-MFuHN_to1"
          ></div>
        </div>
        <motion.button
          className={`w-full py-3 text-white font-semibold text-lg rounded-xl transform hover:scale-105 ${
            canRequest ? 'bg-brand-orange' : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={sendTokens}
          disabled={!canRequest}
        >
          {canRequest ? 'Request Funds' : 'Rate Limited'}
        </motion.button>

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
