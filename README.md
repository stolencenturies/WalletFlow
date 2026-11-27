# WalletFlow

**A modern, responsive Web3 portfolio dashboard built with React, TypeScript, Vite, and CSS.**

WalletFlow provides a fintech-inspired interface for exploring digital asset holdings, monitoring portfolio analytics, managing demo transactions, and connecting a browser wallet in read-only mode.

<p align="center">
  <a href="https://wallet-flow-lovat.vercel.app/"><strong>Live Demo</strong></a>
  ·
  <a href="https://github.com/stolencenturies/WalletFlow"><strong>GitHub Repository</strong></a>
</p>

---

## Features

### Portfolio Dashboard
- Dark, responsive fintech-inspired interface.
- Portfolio value and asset allocation overview.
- Interactive portfolio performance chart with selectable time ranges.
- Balance visibility toggle.
- Overview of assets, recent activity, and wallet status.

### Asset Management
- Demo asset holdings for ETH, BTC, and USDC.
- Portfolio data and demo prices.
- Locally persisted portfolio changes.

### Transaction Management
- Simulated Send, Receive, Swap, and Buy actions.
- Transaction history with search and filtering.
- Delete individual demo transactions.
- Clear transaction history.
- Export transaction history as CSV.
- Local browser persistence for demo records.

### Wallet Connectivity
- Optional MetaMask connection through the browser wallet provider.
- Read-only wallet information.
- Native ETH balance retrieval.
- Wallet account and network change synchronization.
- Wallet connection status and error handling.

### User Experience
- Responsive sidebar navigation.
- Mobile-friendly layout.
- Toast notifications.
- Input validation and defensive error handling.
- Persistent demo data using localStorage.

---

## Important Disclaimer

WalletFlow is an educational frontend portfolio project, not a production cryptocurrency wallet or financial service.

- Portfolio prices and chart performance are illustrative demo data.
- Send, Receive, Swap, and Buy actions are simulations.
- Demo transactions do not transfer actual funds.
- MetaMask connectivity is read-only and is used to retrieve publicly available wallet information.
- WalletFlow does not request transaction signatures or execute blockchain transactions.
- Demo portfolio records are stored locally in the browser.

Never send cryptocurrency to placeholder addresses displayed by the application.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| Vite | Development server and build tooling |
| CSS | Styling and responsive layouts |
| Recharts | Portfolio charts |
| ethers.js | Wallet and blockchain data interaction |
| Lucide React | Icons |
| localStorage | Local demo data persistence |
| MetaMask | Optional read-only browser wallet connection |

---

## Getting Started

### Requirements

- Node.js (20 LTS recommended)
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/stolencenturies/WalletFlow.git
```

### 2. Enter the project directory

```bash
cd WalletFlow
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint checks |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |

### Production Build

To create and verify a production build:

```bash
npm run lint
npm run build
npm run preview
```

---

## Project Structure

```text
WalletFlow/
├── public/
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── data.ts
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Deployment

WalletFlow is deployed using Vercel.

**Live Application:**  
https://wallet-flow-lovat.vercel.app/

The project is connected to GitHub for deployment updates.

---

## Future Improvements

Potential areas for future development:

- Additional portfolio analytics.
- More detailed asset information.
- Improved accessibility.
- Expanded automated testing.
- Further performance optimization.

---

## License

This project is provided for educational and portfolio demonstration purposes.

