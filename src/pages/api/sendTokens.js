import { SecretNetworkClient, Wallet } from "secretjs";

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

    const tx = await secretjs.tx.bank.send(
      {
        amount: [{ amount: "1000000", denom: "uscrt" }],
        from_address: wallet.address,
        to_address: walletAddress,
      },
      { gasLimit: 100_000, gasPriceInFeeDenom: 0.25, memo: "send tokens" }
    );

    return res.status(200).json({ success: true, txHash: tx.transactionHash });
  } catch (error) {
    console.error("Transaction failed:", error);
    return res.status(500).json({ error: error.message });
  }
}
