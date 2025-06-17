import request from "supertest";
import { ethers } from "ethers";
import app from "../server";

describe("Signature Verification API", () => {
  describe("POST /verify-signature", () => {
    let wallet: ethers.HDNodeWallet;
    let testMessage: string;
    let validSignature: string;

    beforeAll(async () => {
      // Create a test wallet and sign a message for testing
      wallet = ethers.Wallet.createRandom();
      testMessage = "Hello, Web3 World!";
      validSignature = await wallet.signMessage(testMessage);
    });

    it("should verify a valid signature successfully", async () => {
      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: testMessage,
          signature: validSignature,
        })
        .expect(200);

      expect(response.body).toEqual({
        isValid: true,
        signer: wallet.address,
        originalMessage: testMessage,
      });
    });

    it("should reject an invalid signature", async () => {
      const invalidSignature =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12";

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: testMessage,
          signature: invalidSignature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should recover different address when message is tampered", async () => {
      const tamperedMessage = "Hello, Web3 World! (tampered)";

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: tamperedMessage,
          signature: validSignature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBeDefined();
      expect(response.body.signer).not.toBe(wallet.address);
      expect(response.body.originalMessage).toBe(tamperedMessage);
    });

    it("should handle missing message field", async () => {
      const response = await request(app)
        .post("/verify-signature")
        .send({
          signature: validSignature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should handle missing signature field", async () => {
      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: testMessage,
        })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should recover different address with empty message", async () => {
      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: "",
          signature: validSignature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBeDefined();
      expect(response.body.signer).not.toBe(wallet.address);
      expect(response.body.originalMessage).toBe("");
    });

    it("should handle empty signature", async () => {
      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: testMessage,
          signature: "",
        })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should handle malformed signature", async () => {
      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: testMessage,
          signature: "not-a-valid-signature",
        })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should handle non-string message", async () => {
      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: 12345,
          signature: validSignature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should handle non-string signature", async () => {
      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: testMessage,
          signature: 12345,
        })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("Server Health", () => {
    it("should handle unknown endpoints with 404", async () => {
      await request(app).get("/unknown-endpoint").expect(404);
    });

    it("should handle wrong HTTP method on verify endpoint", async () => {
      await request(app).get("/verify-signature").expect(404);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long messages", async () => {
      const wallet = ethers.Wallet.createRandom();
      const longMessage = "A".repeat(10000); // Very long message
      const signature = await wallet.signMessage(longMessage);

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: longMessage,
          signature: signature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBe(wallet.address);
    });

    it("should handle unicode characters in message", async () => {
      const wallet = ethers.Wallet.createRandom();
      const unicodeMessage = "🚀 Hello, 世界! Ethereum signature test 💎";
      const signature = await wallet.signMessage(unicodeMessage);

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: unicodeMessage,
          signature: signature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBe(wallet.address);
      expect(response.body.originalMessage).toBe(unicodeMessage);
    });
  });
});
