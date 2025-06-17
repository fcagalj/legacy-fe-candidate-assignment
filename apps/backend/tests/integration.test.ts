import request from "supertest";
import { ethers } from "ethers";
import app from "../server";

describe("Integration Tests", () => {
  describe("Realistic Web3 Scenarios", () => {
    it("should verify signature from a metamask-style message", async () => {
      // Simulate a message that would be typical from a dApp
      const wallet = ethers.Wallet.createRandom();
      const dappMessage = `Welcome to MyDApp!

Click to sign in and accept the MyDApp Terms of Service: https://mydapp.com/tos

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address:
${wallet.address}

Nonce: abc123`;

      const signature = await wallet.signMessage(dappMessage);

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: dappMessage,
          signature: signature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBe(wallet.address);
      expect(response.body.originalMessage).toBe(dappMessage);
    });

    it("should handle JSON-stringified messages", async () => {
      const wallet = ethers.Wallet.createRandom();
      const messageObject = {
        action: "login",
        timestamp: Date.now(),
        user: wallet.address,
        domain: "mydapp.com",
      };
      const jsonMessage = JSON.stringify(messageObject);
      const signature = await wallet.signMessage(jsonMessage);

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: jsonMessage,
          signature: signature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBe(wallet.address);
      expect(response.body.originalMessage).toBe(jsonMessage);
    });

    it("should verify signatures from multiple different wallets", async () => {
      const wallets = Array.from({ length: 5 }, () =>
        ethers.Wallet.createRandom()
      );
      const message = "Multi-wallet test message";

      const verificationPromises = wallets.map(async (wallet) => {
        const signature = await wallet.signMessage(message);
        return request(app)
          .post("/verify-signature")
          .send({
            message: message,
            signature: signature,
          })
          .expect(200);
      });

      const responses = await Promise.all(verificationPromises);

      responses.forEach((response, index) => {
        expect(response.body.isValid).toBe(true);
        expect(response.body.signer).toBe(wallets[index].address);
        expect(response.body.originalMessage).toBe(message);
      });

      // Verify all addresses are different
      const addresses = responses.map((r) => r.body.signer);
      const uniqueAddresses = new Set(addresses);
      expect(uniqueAddresses.size).toBe(wallets.length);
    });
  });

  describe("Performance Tests", () => {
    it("should handle concurrent verification requests", async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = "Concurrent test message";
      const signature = await wallet.signMessage(message);

      // Create 10 concurrent requests
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app)
          .post("/verify-signature")
          .send({
            message: message,
            signature: signature,
          })
          .expect(200)
      );

      const responses = await Promise.all(concurrentRequests);

      responses.forEach((response) => {
        expect(response.body.isValid).toBe(true);
        expect(response.body.signer).toBe(wallet.address);
        expect(response.body.originalMessage).toBe(message);
      });
    });

    it("should complete verification in reasonable time", async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = "Performance test message";
      const signature = await wallet.signMessage(message);

      const startTime = Date.now();

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: message,
          signature: signature,
        })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBe(wallet.address);
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });

  describe("Edge Case Messages", () => {
    it("should handle messages with special characters and escape sequences", async () => {
      const wallet = ethers.Wallet.createRandom();
      const specialMessage =
        "Test message with:\n- newlines\r\n- tabs\t\t\n- quotes \"double\" and 'single'\n- backslashes \\\\ and forward slashes //\n- unicode: 🔐 🌟 ⚡";
      const signature = await wallet.signMessage(specialMessage);

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: specialMessage,
          signature: signature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBe(wallet.address);
      expect(response.body.originalMessage).toBe(specialMessage);
    });

    it("should handle whitespace-only messages", async () => {
      const wallet = ethers.Wallet.createRandom();
      const whitespaceMessage = "   \n\t\r\n   ";
      const signature = await wallet.signMessage(whitespaceMessage);

      const response = await request(app)
        .post("/verify-signature")
        .send({
          message: whitespaceMessage,
          signature: signature,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.signer).toBe(wallet.address);
      expect(response.body.originalMessage).toBe(whitespaceMessage);
    });
  });
});
