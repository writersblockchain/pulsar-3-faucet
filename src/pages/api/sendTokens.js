import { SecretNetworkClient, Wallet } from "secretjs";

async function verifyCaptcha(token) {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const data = await response.json();
  return data.success;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { walletAddress, captchaToken } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  if (!captchaToken) {
    return res.status(400).json({ error: "CAPTCHA verification is required" });
  }

  try {
    // Verify CAPTCHA first
    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ error: "Invalid CAPTCHA" });
    }

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
    return res.status(500).json({ error: error.message });
  }
}
