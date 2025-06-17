import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

interface VerifyRequest {
  message: string;
  signature: string;
}

app.post("/verify-signature", (req: Request, res: Response) => {
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
  });
}
