"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ethers_1 = require("ethers");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/verify-signature", (req, res) => {
    const { message, signature } = req.body;
    try {
        const signer = ethers_1.ethers.verifyMessage(message, signature);
        res.json({
            isValid: true,
            signer,
            originalMessage: message,
        });
    }
    catch (error) {
        res.json({
            isValid: false,
            error: error.message,
        });
    }
});
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
