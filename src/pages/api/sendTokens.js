import { SecretNetworkClient, Wallet } from "secretjs";

export const config = {
  api: {
    bodyParser: true,
  },
  runtime: 'edge', // Use Edge Runtime for longer timeouts
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    const mnemonic = process.env.SECRET_MNEMONIC;
    if (!mnemonic) {
      throw new Error("Mnemonic not found in environment variables.");
    }

    const wallet = new Wallet(mnemonic);
    const secretjs = new SecretNetworkClient({
      chainId: "pulsar-3",
      url: "https://pulsar.lcd.secretnodes.com",
      wallet,
      walletAddress: wallet.address,
    });

    // Execute the transaction and wait for completion
    const tx = await secretjs.tx.bank.send(
      {
        amount: [{ amount: "10000000", denom: "uscrt" }],
        from_address: wallet.address,
        to_address: walletAddress,
      },
      { gasLimit: 100_000, gasPriceInFeeDenom: 0.25, memo: "send tokens" }
    );

    // Return the transaction hash to the frontend
    return res.status(200).json({ success: true, txHash: tx.transactionHash });

  } catch (error) {
    console.error("Transaction failed:", error);
    
    // Handle specific error types
    if (error.message.includes("timeout")) {
      return res.status(504).json({ 
        error: "Transaction is taking longer than expected. Please check your wallet in a few minutes." 
      });
    }
    
    if (error.message.includes("insufficient funds")) {
      return res.status(400).json({ 
        error: "Insufficient funds in faucet wallet. Please try again later." 
      });
    }

    // Generic error response
    return res.status(500).json({ 
      error: "Transaction failed. Please try again later." 
    });
  }
}
