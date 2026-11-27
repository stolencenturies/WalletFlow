
# WalletFlow — Developer Guide

This guide explains how to set up WalletFlow locally, understand its current repository structure, and follow a consistent development workflow.

## 1. Prerequisites

Before starting, make sure you have:

- Node.js installed (Node.js 20 LTS recommended).
- npm installed.
- Git installed.
- A code editor such as Visual Studio Code.

Check your installations:

```bash
node --version
npm --version
git --version
```

## 2. Clone the Repository

Clone the WalletFlow repository:

```bash
git clone https://github.com/stolencenturies/WalletFlow.git
```

Navigate into the project:

```bash
cd WalletFlow
```

Install dependencies:

```bash
npm install
```

## 3. Run the Development Server

Start the local development server:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## 4. Available Scripts

Run these commands from the project root.

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run lint` | Runs ESLint checks |
| `npm run build` | Runs the TypeScript project build and Vite production build |
| `npm run preview` | Previews the production build locally |

## 5. Current Project Structure

The current repository uses a relatively compact frontend structure. Most application interface and interaction logic is located in `src/App.tsx`, while supporting data utilities and shared types are maintained in separate files.

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
│   ├── developer-guide.md
│   └── engineering-case-study.md
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

### Important source files

| File | Responsibility |
|---|---|
| `src/App.tsx` | Main application interface, state management, interactions, and wallet integration |
| `src/data.ts` | Initial demonstration data, portfolio calculations, formatting, and chart-data utilities |
| `src/types.ts` | Shared TypeScript data types |
| `src/main.tsx` | React application entry point |
| `src/App.css` | Main application styling |
| `src/index.css` | Global styling |
| `package.json` | Dependencies and development scripts |

The architecture is intentionally compact. The current implementation does not contain a separate components, hooks, or services directory. Those could be introduced as future refactoring work.

## 6. Development Workflow

When making a change:

1. Understand the existing feature and relevant source files.
2. Make a focused change.
3. Run the development server.
4. Test the affected functionality in the browser.
5. Run ESLint.
6. Create a production build.
7. Review the final changes before committing.

Useful commands:

```bash
npm run dev
npm run lint
npm run build
```

## 7. Git Workflow

Review changed files:

```bash
git status
```

Review the actual changes:

```bash
git diff
```

Stage your changes:

```bash
git add .
```

Create a commit:

```bash
git commit -m "Describe your changes"
```

Push to GitHub:

```bash
git push origin main
```

Use clear commit messages that describe the work completed.

## 8. Coding Guidelines

- Use TypeScript for application logic.
- Prefer clear and reusable functions.
- Keep variable and function names descriptive.
- Handle invalid inputs and unexpected errors.
- Preserve responsive behaviour.
- Avoid duplicating existing functionality.
- Keep demonstration portfolio data separate from wallet information.
- Document important technical decisions.
- Test affected functionality before committing changes.

As the application grows, consider separating major responsibilities into dedicated components, hooks, services, and utility modules.

## 9. Wallet Safety

WalletFlow is an educational frontend demonstration.

- Wallet connection can require user approval for account access.
- The application is designed to retrieve selected wallet information without transaction signing.
- Do not add private-key collection or storage.
- Do not request users' seed phrases or recovery phrases.
- Do not imply that simulated transactions transfer real funds.
- Keep wallet-related permissions and behaviour transparent.

Read-only wallet connectivity does not mean that the application requires no wallet permission. Account access is subject to the wallet provider's approval.

## 10. Before Submitting Changes

Review this checklist:

- [ ] The application starts successfully.
- [ ] The affected feature works.
- [ ] The responsive layout remains usable.
- [ ] No unexpected browser-console errors appear.
- [ ] ESLint passes.
- [ ] The production build succeeds.
- [ ] Documentation is updated when necessary.
- [ ] The final Git diff has been reviewed.

---

**WalletFlow Developer Guide**

Built with React, TypeScript, Vite, and CSS.
