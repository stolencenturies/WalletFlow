
# Developer Guide

This guide explains how to set up WalletFlow locally, understand its project structure, and make changes safely.

## 1. Prerequisites

Before starting, make sure you have:

- Node.js installed
- npm installed
- Git installed
- A code editor such as Visual Studio Code

Check your installations:

```bash
node --version
npm --version
git --version
```

## 2. Clone the Repository

Clone the WalletFlow repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
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

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run lint` | Runs ESLint checks |
| `npm run build` | Creates the production build |
| `npm run preview` | Previews the production build locally |

Run these commands from the project root.

## 5. Project Structure

The project is organized around the React application, reusable components, styling, and supporting documentation.

```text
WalletFlow/
├── public/
│   └── images/
├── docs/
│   ├── architecture.md
│   ├── data-flow.md
│   ├── technical-decisions.md
│   ├── testing.md
│   └── developer-guide.md
├── src/
│   ├── components/
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

This is a high-level overview. Your actual repository may contain additional files and folders.

## 6. Development Workflow

When making a change:

1. Understand the existing component or feature.
2. Make a focused change.
3. Run the development server.
4. Test the affected functionality in the browser.
5. Run ESLint.
6. Create a production build.
7. Review the final changes before committing.

Useful commands:

```bash
npm run lint
npm run build
```

## 7. Git Workflow

Review changed files:

```bash
git status
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
git push
```

Use clear commit messages that describe the work completed.

## 8. Coding Guidelines

- Use TypeScript for application logic.
- Prefer reusable React components.
- Keep component responsibilities clear.
- Use descriptive variable and function names.
- Handle invalid inputs and unexpected errors.
- Preserve responsive behavior.
- Avoid duplicating existing functionality.
- Keep demo and wallet functionality clearly separated.

## 9. Wallet Safety

WalletFlow is an educational frontend demonstration.

- Wallet connection is intended to be read-only.
- Do not add private-key collection or storage.
- Do not request users' seed phrases.
- Do not imply that simulated transactions transfer real funds.
- Keep wallet-related permissions and behavior transparent.

## 10. Before Submitting Changes

Review this checklist:

- [x] The application starts successfully.
- [x] The affected feature works.
- [x] The responsive layout remains usable.
- [x] No unexpected browser-console errors appear.
- [x] ESLint passes.
- [x] The production build succeeds.
- [x] Documentation is updated when necessary.

---

**WalletFlow Developer Guide**

Built with React, TypeScript, Vite, and CSS.
