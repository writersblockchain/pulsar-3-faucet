"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SecretNetworkClient, Wallet } from "secretjs";

export default function Home() {

  const [walletAddress, setWalletAddress] = useState("");

  const wallet = new Wallet("mobile frozen hold forget tomorrow sphere pelican exile canyon pen awake useless");
  const secretjs = new SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://pulsar.lcd.secretnodes.com",
    wallet: wallet,
    walletAddress: wallet.address,
  });


  const send_tokens = async () => {
  
    const tx = await secretjs.tx.bank.send(
      {
        amount: [{ amount: "1000000", denom: "uscrt" }],
        from_address: wallet.address,
        to_address: walletAddress,
      },
      {
        gasLimit: 100_000,
        gasPriceInFeeDenom: 0.25,
        memo: "send tokens",
      }
    );
    console.log(tx);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-tan p-6">
      <motion.h1 
        className="text-5xl font-extrabold text-brand-orange mb-6 text-center break-words"
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
          className="w-full p-3 border border-brand-blue rounded-xl text-lg focus:ring-2 focus:ring-brand-blue focus:outline-none break-all"
          placeholder="Enter your wallet address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="none"
        />
        <motion.button
          className="w-full py-3 bg-brand-orange text-white font-semibold text-lg rounded-xl transition-all transform hover:scale-105"
          onClick={send_tokens}
          whileHover={{ scale: 1.04 }}
        >
          Request Funds
        </motion.button>
        { (
          <motion.p 
            className="text-center text-brand-blue font-medium text-base break-words"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}