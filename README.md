# WalletFlow

A responsive fintech-style cryptocurrency portfolio dashboard built with React, TypeScript, Vite, and CSS.

## Features

- Dark, responsive portfolio dashboard
- Portfolio value calculated from asset balances and demo prices
- Asset holdings for ETH, BTC, and USDC
- Simulated Send, Receive, Swap, and Buy actions
- Searchable recent activity feed
- Balance visibility toggle
- Toast notifications and responsive mobile navigation

## Important demo disclaimer

WalletFlow is a frontend portfolio project. All prices and transactions are sample data. It does not connect to a blockchain, create real wallet addresses, move funds, or process payments. Never send funds to the placeholder addresses shown in the Receive dialog.

## Requirements

- Node.js 18 or newer (Node.js 20 LTS recommended)
- npm
- Git (optional, for version control)

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Quality checks

```bash
npm run lint
npm run build
```

## Project structure

```text
walletflow/
├── public/
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── data.ts
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## GitHub

Create an empty repository on GitHub, then run these commands in the project folder (replace the URL with your repository URL):

```bash
git init
git add .
git commit -m "feat: build WalletFlow portfolio dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/walletflow.git
git push -u origin main
```

After future changes:

```bash
git add .
git commit -m "describe your change"
git push
```

## License

This project is provided for learning and portfolio demonstration.
