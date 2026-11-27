
# WalletFlow

### A modern Web3 portfolio dashboard built with React, TypeScript, and Vite.

WalletFlow is a responsive fintech-inspired cryptocurrency portfolio dashboard designed to explore digital asset holdings, visualize portfolio analytics, manage simulated transactions, and connect a browser wallet in read-only mode.

<p align="center">
  <a href="https://wallet-flow-lovat.vercel.app/">
    <strong>🌐 Live Demo</strong>
  </a>
</p>

---

## Preview

### Dashboard

![WalletFlow Dashboard](public/images/dashboard.png)

### My Assets

![WalletFlow Assets](public/images/assets.png)

### Transaction History

![WalletFlow Transactions](public/images/transactions.png)

### Wallet Connection

![WalletFlow Wallet Connection](public/images/wallet-connection.png)

---

## Features

### Portfolio Dashboard
- Dark, responsive fintech-inspired interface.
- Portfolio value and asset allocation overview.
- Interactive portfolio performance chart with selectable time ranges.
- Balance visibility toggle.
- Overview of assets, recent activity, and wallet status.

### Asset Management
- Demo holdings for Ethereum (ETH), Bitcoin (BTC), and USD Coin (USDC).
- Asset prices and portfolio valuation using illustrative data.
- Locally persisted demo portfolio changes.

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
- Mobile-friendly layouts.
- Toast notifications.
- Input validation and error handling.
- Local storage persistence.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| Vite | Development and build tooling |
| CSS | Styling and responsive layouts |
| Recharts | Portfolio charts |
| ethers.js | Wallet and blockchain data interaction |
| Lucide React | Icons |
| localStorage | Local demo data persistence |
| MetaMask | Optional read-only wallet connection |

---

## Documentation

WalletFlow includes technical documentation covering its architecture, application data flows, engineering decisions, testing process, and developer setup.

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | Application structure, layers, and system architecture |
| [Data Flow](docs/data-flow.md) | Portfolio, transaction, and wallet data flows |
| [Technical Decisions](docs/technical-decisions.md) | Technology choices, trade-offs, and design decisions |
| [Testing & Quality Assurance](docs/testing.md) | Verification commands and manual testing checklist |
| [Developer Guide](docs/developer-guide.md) | Installation, development workflow, and contribution guidelines |

---

## Getting Started

### Requirements

- Node.js 20 LTS recommended
- npm
- Git

### Installation

**1. Clone the repository**

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

**2. Navigate into the project directory**

```bash
cd WalletFlow
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL provided by Vite, usually:

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
| `npm run preview` | Preview the production build |

### Production Verification

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
│   └── images/
│       ├── dashboard.png
│       ├── assets.png
│       ├── transactions.png
│       └── wallet-connection.png
├── docs/
│   ├── architecture.md
│   ├── data-flow.md
│   ├── technical-decisions.md
│   ├── testing.md
│   └── developer-guide.md
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── data.ts
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
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

WalletFlow is deployed on Vercel.

**Live Application:**  
https://wallet-flow-lovat.vercel.app/

The GitHub repository is connected to Vercel for automated deployments when changes are pushed to the production branch.

---

## Important Disclaimer

WalletFlow is an educational frontend portfolio project, not a production cryptocurrency wallet or financial service.

- Portfolio prices and chart performance are illustrative demo data.
- Send, Receive, Swap, and Buy actions are simulations.
- Demo transactions do not transfer actual funds.
- MetaMask connectivity is read-only and retrieves publicly available wallet information.
- WalletFlow does not request transaction signatures or execute blockchain transactions.
- Demo portfolio records are stored locally in the browser.

Never send cryptocurrency to placeholder addresses displayed by the application.

---

## Future Improvements

Potential areas for future development:

- Expanded portfolio analytics.
- More detailed asset information.
- Improved accessibility.
- Expanded automated testing.
- Further performance optimization.

---

## License

This project is provided for educational and portfolio demonstration purposes.
