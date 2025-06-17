# Take-Home Task: **Web3 Message Signer & Verifier**

A full-stack Web3 application built for message signing and verification using Dynamic.xyz embedded wallet, React, Node.js, Express, TypeScript, and ethers.js.

---

## 🧩 Project Features

- Web3 wallet authentication via Dynamic.xyz headless implementation
- Message signing with wallet private key
- Signature verification using backend (ethers.js)
- Full TypeScript support (frontend & backend)
- Clean React architecture with MUI (Material-UI)
- Frontend and backend test suites (Vitest & Jest)
- Separation of concerns using Context, Hooks, and Components

---

## 📂 Project Structure

```
project-root/
  frontend/   (React + Vite + TypeScript + MUI + Dynamic.xyz)
  backend/    (Node.js + Express + TypeScript + ethers.js)
  README.md
```

---

## 🚀 Tech Stack

### Frontend

- React 19
- Vite
- TypeScript
- MUI (Material UI)
- Dynamic.xyz SDK
- Axios
- Vitest + React Testing Library (unit tests)

### Backend

- Node.js
- Express
- TypeScript
- ethers.js
- Jest + Supertest (unit + integration tests)

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js >= 18.x.x
- NPM >= 9.x.x

---

### Backend Setup

```bash
cd backend
npm install
```

#### Create `.env` file:

```env
PORT=5000
```

#### Run backend:

```bash
npm run dev
```

The backend server will run on:  
`http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend
npm install
```

#### Create `.env` file:

```env
VITE_DYNAMIC_ENV_ID=your_dynamic_environment_id
VITE_BACKEND_URL=http://localhost:5000
```

Make sure to whitelist your local domain in Dynamic.xyz Dashboard:

```
http://localhost:3200
```

#### Run frontend:

```bash
npm run dev
```

Frontend will run on:  
`http://localhost:3200`

---

## 🎯 Application Flow

1. User connects wallet via Dynamic.xyz embedded wallet.
2. User inputs a message.
3. Message is signed with wallet private key.
4. Signed message and signature are submitted to backend.
5. Backend verifies the signature using ethers.js.
6. Verification result is displayed to user.

---

## 📌 Trade-Offs / Improvements

- Simple signature verification without database persistence.
- No roles/auth at this stage (can be added with Dynamic.xyz MFA or OAuth).
- Frontend state is kept locally in-memory (can be extended to localStorage for history persistence).
- Per-message verification status can be added for UX improvements.

---

✅ **Thank you for reviewing my submission!**
