### ChainGPT - Solana Transaction Explainer & Security Guard

Understand what you're signing before you sign it.

### Problem Statement

Web3 users frequently sign transactions without fully understanding what they're approving. This lack of transparency has led to countless phishing attacks and scams in the Solana ecosystem.
ChainGPT solves this by translating complex blockchain operations into plain English before you commit.
What ChainGPT Does
ChainGPT is a browser extension that interposes itself between dApps and your wallet. When a transaction is about to be signed:

Intercepts the unsigned transaction data
Analyzes the programs, instructions, and addresses involved
Verifies against databases of trusted and malicious entities
Generates a human-readable explanation using AI
Alerts you to potential risks before signing

### Demo

https://github.com/user-attachments/assets/29b349f8-6395-4c50-9d49-55ae85268b3f

### Key Features
AI-Powered Transaction Explanations

Converts complex Solana instructions into clear, understandable language
Explains what will happen if you sign: "This transaction will swap 10 SOL for approximately 134.5 USDC using Jupiter aggregator"

### Security Analysis

Program Verification: Checks if the programs being called are widely trusted

Address Screening: Flags known malicious addresses or suspicious patterns
Permission Alerts: Warns about transactions granting extensive permissions
Risk Assessment: Provides an overall risk score for each transaction

### Technical Features

Lightweight browser extension with minimal overhead
Works with popular Solana wallets (Phantom, Solflare, etc.)
Privacy-focused - your transaction data stays local or is sent securely
Custom trusted/blocked address lists

### For Developers

```
bash

#Clone the Repo
git clone https://github.com/lazim17/ChainGPT.git
cd ChainGPT

#Install Dependencies
npm install

#Build the Extension
npm run build

# Load in Chrome:
# 1. Go to chrome://extensions
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
```

### Tech Stack

Frontend: TypeScript, React
Transaction Parsing: @solana/web3.js
AI Integration: LLM API

### Roadmap

[x] Initial MVP with basic transaction parsing  
[x] AI-powered transaction explanations  
[ ] Enhanced security database integration  
[ ] Account for token metadata (display token names, not just addresses)  
[ ] Support for more complex transaction types (CPI calls, etc.)  
[ ] Firefox extension support  
[ ] Community-driven security database  
[ ] Advanced risk scoring algorithm  

### Made with love for the Solana community
  
### Support This Project

If you find ChainGPT valuable, please consider supporting its development:
SOL Address: D3XVQroYdXEEzNLRmPGUiZZzez6bAkp2xoPJ1Xy8K8xK



