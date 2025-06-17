# Take-Home Task: **Web3 Message Signer & Verifier**

A full-stack Web3 application built for message signing and verification using Dynamic.xyz embedded wallet, React, Node.js, Express, TypeScript, and ethers.js.

**Project is organized as a Turbo Monorepo for optimal development experience!** 🚀

---

## 🧩 Project Features

- Web3 wallet authentication via Dynamic.xyz headless implementation
- Message signing with wallet private key
- Signature verification using backend (ethers.js)
- Full TypeScript support (frontend & backend)
- Clean React architecture with MUI (Material-UI)
- Comprehensive test suites (Vitest & Jest)
- Separation of concerns using Context, Hooks, and Components
- **Turbo monorepo with optimized build pipeline**
- **Parallel task execution and intelligent caching**

---

## 📂 Project Structure

```
web3-signature-verifier/
├── apps/
│   ├── frontend/          (React + Vite + TypeScript + MUI + Dynamic.xyz)
│   └── backend/           (Node.js + Express + TypeScript + ethers.js)
├── packages/              (Shared packages - for future use)
├── turbo.json             (Turbo pipeline configuration)
├── package.json           (Root workspace configuration)
└── README.md
```

---

## 🚀 Tech Stack

### Frontend (`apps/frontend`)

- React 19
- Vite
- TypeScript
- MUI (Material UI)
- Dynamic.xyz SDK
- Axios
- Vitest + React Testing Library (unit tests)

### Backend (`apps/backend`)

- Node.js
- Express
- TypeScript
- ethers.js
- Jest + Supertest (unit + integration tests)

### Monorepo Tools

- **Turbo** - Build system and orchestrator
- **npm workspaces** - Package management
- **TypeScript** - Shared type checking

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js >= 18.x.x
- NPM >= 10.x.x

### Quick Start (Recommended)

```bash
# Install all dependencies across the monorepo
npm install

# Start both frontend and backend in development mode
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend application on `http://localhost:3200`

---

## 🛠️ Available Scripts

### Root Level Scripts

```bash
# Development - starts both apps in parallel
npm run dev

# Build all apps
npm run build

# Run tests across all apps
npm run test

# Lint all apps
npm run lint

# Type checking across all apps
npm run type-check

# Clean all build artifacts
npm run clean
```

### Individual App Scripts

You can also run scripts for individual apps:

```bash
# Frontend only
npm run dev --workspace=apps/frontend
npm run build --workspace=apps/frontend
npm run test --workspace=apps/frontend

# Backend only
npm run dev --workspace=apps/backend
npm run build --workspace=apps/backend
npm run test --workspace=apps/backend
```

---

## 🔧 Environment Configuration

### Backend (`apps/backend/.env`)

```env
PORT=5000
```

### Frontend (`apps/frontend/.env`)

```env
VITE_DYNAMIC_ENV_ID=your_dynamic_environment_id
VITE_BACKEND_URL=http://localhost:5000
```

**Important:** Make sure to whitelist your local domain in Dynamic.xyz Dashboard:

```
http://localhost:3200
```

---

## 🎯 Application Flow

1. User connects wallet via Dynamic.xyz embedded wallet.
2. User inputs a message.
3. Message is signed with wallet private key.
4. Signed message and signature are submitted to backend.
5. Backend verifies the signature using ethers.js.
6. Verification result is displayed to user.

---

## 🏗️ Turbo Benefits

This monorepo setup provides:

- **🚀 Fast Builds** - Turbo's intelligent caching system
- **⚡ Parallel Execution** - Run tasks across apps simultaneously
- **🔄 Incremental Builds** - Only rebuild what has changed
- **📊 Better DX** - Unified commands and consistent tooling
- **🎯 Dependency Management** - Shared dependencies where appropriate

---

## 📌 Trade-Offs / Future Improvements

- Simple signature verification without database persistence
- No roles/auth at this stage (can be added with Dynamic.xyz MFA or OAuth)
- Frontend state is kept locally in-memory (can be extended to localStorage for history persistence)
- Per-message verification status can be added for UX improvements
- **Shared packages** - Add shared utilities, types, and components as the project grows
- **E2E Testing** - Add Playwright or Cypress for end-to-end testing
- **CI/CD Pipeline** - Leverage Turbo's remote caching for faster CI builds

---

## 🚦 Development Workflow

```bash
# Clone and setup
git clone <repository-url>
cd web3-signature-verifier
npm install

# Start development
npm run dev

# Make changes to frontend or backend
# Turbo will automatically handle rebuilds and restarts

# Run tests
npm run test

# Build for production
npm run build
```

---

✅ **Enjoy your optimized Turbo monorepo setup!**

The project is now structured for scalability, with improved developer experience and build performance.
