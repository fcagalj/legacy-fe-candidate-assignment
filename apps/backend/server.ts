import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simple in-memory storage for MFA (demo purposes only)
const mfaStorage: Map<string, { secret: string; isEnabled: boolean }> =
  new Map();

interface VerifyRequest {
  message: string;
  signature: string;
}

// Basic MFA endpoints for demo
app.post("/api/mfa/status", (req: Request, res: Response) => {
  const { email } = req.body;
  const mfaRecord = mfaStorage.get(email);

  res.json({
    isEnabled: mfaRecord?.isEnabled || false,
    isRequired: mfaRecord?.isEnabled || false,
    isVerified: false,
  });
});

app.post("/api/mfa/setup", (req: Request, res: Response) => {
  const { email } = req.body;

  // Mock QR code and secret for demo
  const secret = "JBSWY3DPEHPK3PXP"; // Demo secret
  const qrCode =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="; // Minimal demo QR

  mfaStorage.set(email, { secret, isEnabled: false });

  res.json({
    qrCode,
    secret,
    backupCodes: [],
  });
});

app.post("/api/mfa/verify-setup", (req: Request, res: Response) => {
  const { email, code } = req.body;
  const mfaRecord = mfaStorage.get(email);

  if (!mfaRecord) {
    return res.status(404).json({ error: "MFA setup not found" });
  }

  // For demo, accept any 6-digit code
  if (code.length === 6) {
    mfaRecord.isEnabled = true;
    mfaStorage.set(email, mfaRecord);
    return res.json({ message: "MFA setup completed successfully" });
  } else {
    return res.status(400).json({ error: "Invalid verification code" });
  }
});

app.post("/api/mfa/verify", (req: Request, res: Response) => {
  const { email, code } = req.body;
  const mfaRecord = mfaStorage.get(email);

  if (!mfaRecord || !mfaRecord.isEnabled) {
    return res.status(404).json({ error: "MFA not enabled for this user" });
  }

  // For demo, accept any 6-digit code
  if (code.length === 6) {
    return res.json({
      message: "MFA verification successful",
      token: "demo-mfa-token",
    });
  } else {
    return res.status(400).json({ error: "Invalid verification code" });
  }
});

app.post("/api/mfa/disable", (req: Request, res: Response) => {
  const { email, code } = req.body;
  const mfaRecord = mfaStorage.get(email);

  if (!mfaRecord || !mfaRecord.isEnabled) {
    return res.status(404).json({ error: "MFA not enabled for this user" });
  }

  // For demo, accept any 6-digit code
  if (code.length === 6) {
    mfaStorage.delete(email);
    return res.json({ message: "MFA disabled successfully" });
  } else {
    return res.status(400).json({ error: "Invalid verification code" });
  }
});

app.post("/api/verify-signature", (req: Request, res: Response) => {
  const { message, signature } = req.body as VerifyRequest;

  try {
    const signer = ethers.verifyMessage(message, signature);
    res.json({
      isValid: true,
      signer,
      originalMessage: message,
    });
  } catch (error) {
    res.json({
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

// Export the app for testing
export default app;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
    console.log("MFA endpoints available:");
    console.log("- POST /api/mfa/status - Check MFA status");
    console.log("- POST /api/mfa/setup - Setup MFA");
    console.log("- POST /api/mfa/verify-setup - Verify MFA setup");
    console.log("- POST /api/mfa/verify - Verify MFA during login");
    console.log("- POST /api/mfa/disable - Disable MFA");
  });
}
