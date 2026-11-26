
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowDownUp,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  TrendingUp,
  RefreshCw,
  Clock3,
  Wifi,
  AlertCircle,
} from "lucide-react";
import { BrowserProvider, formatEther } from "ethers";
import {
  assetValue,
  formatBalance,
  formatUSD,
  getChartData,
  initialAssets,
  initialTransactions,
} from "./data";
import type { Asset, Transaction, WalletState } from "./types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import "./App.css";

type Action = "send" | "receive" | "swap" | "buy" | null;
type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

const ranges: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

const supportedNetworks: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
  137: "Polygon",
  80002: "Polygon Amoy",
  84532: "Base Sepolia",
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [activeAction, setActiveAction] = useState<Action>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<ChartRange>("1M");

  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");

  const [amount, setAmount] = useState("");
  const [symbol, setSymbol] = useState("ETH");
  const [targetSymbol, setTargetSymbol] = useState("USDC");
  const [recipient, setRecipient] = useState("");

  const totalValue = useMemo(
    () => assets.reduce((sum, asset) => sum + assetValue(asset), 0),
    [assets]
  );

  const chartData = useMemo(
    () => getChartData(range, totalValue),
    [range, totalValue]
  );

  const filteredTransactions = transactions.filter((tx) =>
    `${tx.name} ${tx.symbol} ${tx.type} ${tx.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const refreshWallet = useCallback(
    async (address?: string, chainId?: number) => {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum as never);
      const accounts = address
        ? [address]
        : await provider.send("eth_accounts", []);

      if (!accounts.length) {
        setWallet(null);
        return;
      }

      const network = await provider.getNetwork();
      const activeAddress = String(accounts[0]);
      const balance = await provider.getBalance(activeAddress);

      setWallet({
        address: activeAddress,
        chainId: chainId ?? Number(network.chainId),
        nativeBalance: Number(formatEther(balance)).toFixed(5),
      });
    },
    []
  );

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWalletError(
        "No browser wallet detected. Install MetaMask from its official website."
      );
      return;
    }

    setWalletLoading(true);
    setWalletError("");

    try {
      const provider = new BrowserProvider(window.ethereum as never);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts.length) {
        throw new Error("No account was selected.");
      }

      await refreshWallet(String(accounts[0]));
      notify("Wallet connected in read-only mode.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not connect wallet.";

      setWalletError(message);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccounts = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? accounts : [];

      if (!list.length) {
        setWallet(null);
        return;
      }

      void refreshWallet(String(list[0]));
    };

    const handleChain = () => {
      void refreshWallet();
    };

    window.ethereum.on?.("accountsChanged", handleAccounts);
    window.ethereum.on?.("chainChanged", handleChain);

    void refreshWallet().catch(() => setWallet(null));

    return () => {
      window.ethereum?.removeListener?.(
        "accountsChanged",
        handleAccounts
      );
      window.ethereum?.removeListener?.(
        "chainChanged",
        handleChain
      );
    };
  }, [refreshWallet]);

  const updateBalance = (
    assetSymbol: string,
    difference: number
  ) => {
    setAssets((current) =>
      current.map((asset) =>
        asset.symbol === assetSymbol
          ? {
              ...asset,
              balance: Math.max(0, asset.balance + difference),
            }
          : asset
      )
    );
  };

  const addTransaction = (
    tx: Omit<Transaction, "id" | "date" | "status">
  ) => {
    setTransactions((current) => [
      {
        ...tx,
        id: crypto.randomUUID(),
        date: "Just now",
        status: "Completed",
      },
      ...current,
    ]);
  };

  const runDemoAction = () => {
    const parsedAmount = Number(amount);
    const source = assets.find(
      (asset) => asset.symbol === symbol
    );

    if (
      !source ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      notify("Enter a valid amount.");
      return;
    }

    if (activeAction === "send") {
      if (!recipient.trim()) {
        notify("Enter a demo recipient label or address.");
        return;
      }

      if (source.balance < parsedAmount) {
        notify("Insufficient demo balance.");
        return;
      }

      updateBalance(symbol, -parsedAmount);

      addTransaction({
        name: source.name,
        symbol,
        type: "Sent",
        amount: `-${formatBalance(parsedAmount, symbol)}`,
      });

      notify("Demo transfer recorded locally. No funds were sent.");
    } else if (
      activeAction === "receive" ||
      activeAction === "buy"
    ) {
      updateBalance(symbol, parsedAmount);

      addTransaction({
        name: source.name,
        symbol,
        type: activeAction === "receive" ? "Received" : "Bought",
        amount: `+${formatBalance(parsedAmount, symbol)}`,
      });

      notify("Demo portfolio updated locally.");
    } else if (activeAction === "swap") {
      const target = assets.find(
        (asset) => asset.symbol === targetSymbol
      );

      if (!target || target.symbol === source.symbol) {
        notify("Choose two different assets.");
        return;
      }

      if (source.balance < parsedAmount) {
        notify("Insufficient demo balance.");
        return;
      }

      const output =
        (parsedAmount * source.priceUsd * 0.995) /
        target.priceUsd;

      setAssets((current) =>
        current.map((asset) => {
          if (asset.symbol === source.symbol) {
            return {
              ...asset,
              balance: asset.balance - parsedAmount,
            };
          }

          if (asset.symbol === target.symbol) {
            return {
              ...asset,
              balance: asset.balance + output,
            };
          }

          return asset;
        })
      );

      addTransaction({
        name: `${source.name} → ${target.name}`,
        symbol: target.symbol,
        type: "Swapped",
        amount: `${formatBalance(parsedAmount, source.symbol)} → ${formatBalance(output, target.symbol)}`,
      });

      notify(
        "Demo swap recorded locally. No blockchain transaction occurred."
      );
    }

    setActiveAction(null);
    setAmount("");
    setRecipient("");
  };

  const openAction = (action: Action) => {
    setAmount("");
    setRecipient("");
    setActiveAction(action);
  };

  const copyAddress = async () => {
    if (!wallet?.address) return;

    await navigator.clipboard.writeText(wallet.address);
    notify("Wallet address copied.");
  };

  const networkName = wallet
    ? supportedNetworks[wallet.chainId] ??
      `Chain ID ${wallet.chainId}`
    : "Not connected";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Wallet size={21} />
          </div>
          <span>
            Wallet<span className="brand-accent">Flow</span>
          </span>
          <button
            className="icon-btn mobile-close"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav-list">
          <a className="nav-item active" href="#overview">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a className="nav-item" href="#assets">
            <Wallet size={18} /> My assets
          </a>
          <a className="nav-item" href="#activity">
            <ArrowLeftRight size={18} /> Transactions
          </a>
        </nav>

        <div className="workspace-label tools-label">
          PREFERENCES
        </div>

        <nav className="nav-list">
          <button
            className="nav-item"
            onClick={() =>
              notify("Settings panel is planned for a future release.")
            }
          >
            <Settings size={18} /> Settings
          </button>
          <button
            className="nav-item"
            onClick={() =>
              notify("Help documentation is included in the GitHub README.")
            }
          >
            <CircleHelp size={18} /> Help center
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Sparkles size={17} />
            </div>
            <strong>Make your money flow.</strong>
            <p>Explore your portfolio with a clearer view.</p>
            <button
              onClick={() =>
                document
                  .getElementById("wallet-panel")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore wallet <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="profile-row">
            <div className="avatar">WF</div>
            <div className="profile-copy">
              <strong>Demo Workspace</strong>
              <span>Local portfolio preview</span>
            </div>
            <MoreHorizontal size={19} className="muted-icon" />
          </div>
        </div>
      </aside>

      {mobileNav && (
        <button
          className="nav-backdrop"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-area" id="overview">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn mobile-menu"
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <span className="breadcrumb-muted">Workspace</span>
              <span className="breadcrumb-slash">/</span>
              <strong>Overview</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="status-pill">
              <span /> Read-only demo
            </div>
            <button
              className="icon-btn notification-btn"
              onClick={() => notify("You're all caught up.")}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <div className="top-avatar">WF</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                WALLET & PORTFOLIO WORKSPACE
              </div>
              <h1>
                Good evening <span>👋</span>
              </h1>
              <p className="subheading">
                A clearer view of your digital-asset portfolio.
              </p>
            </div>

            <div className="welcome-actions">
              <button
                className="btn btn-secondary"
                onClick={() => openAction("receive")}
              >
                <ArrowDownLeft size={16} /> Receive demo
              </button>
              <button
                className="btn btn-primary"
                onClick={() => openAction("send")}
              >
                <ArrowUpRight size={16} /> Send demo
              </button>
            </div>
          </section>

          <section className="overview-grid">
            <div className="balance-panel">
              <div className="panel-top">
                <span className="panel-label">
                  TOTAL DEMO PORTFOLIO VALUE
                </span>
                <button
                  className="visibility-btn"
                  onClick={() => setHideBalance(!hideBalance)}
                  aria-label="Toggle balance visibility"
                >
                  {hideBalance ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              <div className="balance-number">
                {hideBalance ? "••••••••" : formatUSD(totalValue)}
              </div>

              <div className="balance-change">
                <span className="change-chip">
                  <TrendingUp size={13} /> 3.24%
                </span>
                <span>Illustrative sample performance</span>
              </div>

              <div className="chart-heading">
                <span>Portfolio trend</span>
                <span className="chart-note">
                  Illustrative · not historical market data
                </span>
              </div>

              <div className="balance-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 2, left: 2, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="portfolioGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#a78bfa"
                          stopOpacity={0.32}
                        />
                        <stop
                          offset="100%"
                          stopColor="#a78bfa"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#ffffff"
                      strokeOpacity={0.06}
                      vertical={false}
                    />

                    <XAxis dataKey="label" hide />

                    <Tooltip
                      contentStyle={{
                        background: "#171b2b",
                        border: "1px solid #343950",
                        borderRadius: 9,
                        color: "#fff",
                        fontSize: 11,
                      }}
                      formatter={(value) => [
                        formatUSD(Number(value)),
                        "Illustrative value",
                      ]}
                      labelFormatter={() => ""}
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#a78bfa"
                      strokeWidth={2.5}
                      fill="url(#portfolioGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-footer">
                {ranges.map((item) => (
                  <button
                    key={item}
                    className={range === item ? "selected" : ""}
                    onClick={() => setRange(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="quick-panel" id="wallet-panel">
              <div className="panel-top">
                <span className="panel-label">
                  WALLET CONNECTION
                </span>
                <span className="read-only-tag">
                  <ShieldCheck size={12} /> READ ONLY
                </span>
              </div>

              {wallet ? (
                <div className="connected-wallet">
                  <div className="wallet-connected-icon">
                    <Check size={20} />
                  </div>
                  <strong>Wallet connected</strong>
                  <span className="wallet-address">
                    {shortenAddress(wallet.address)}
                  </span>
                  <button
                    className="copy-address-inline"
                    onClick={() => void copyAddress()}
                  >
                    <Copy size={13} /> Copy address
                  </button>
                  <div className="wallet-detail">
                    <span>Network</span>
                    <strong>{networkName}</strong>
                  </div>
                  <div className="wallet-detail">
                    <span>Native balance</span>
                    <strong>{wallet.nativeBalance} ETH</strong>
                  </div>
                  <button
                    className="btn btn-secondary wallet-refresh"
                    onClick={() => void refreshWallet()}
                  >
                    <RefreshCw size={14} /> Refresh balance
                  </button>
                </div>
              ) : (
                <div className="wallet-connect-content">
                  <div className="wallet-illustration">
                    <Wallet size={28} />
                  </div>
                  <h3>Connect a browser wallet</h3>
                  <p>
                    Read your public address, network and native test
                    balance. WalletFlow never asks for your recovery phrase.
                  </p>
                  <button
                    className="btn btn-primary connect-btn"
                    onClick={() => void connectWallet()}
                    disabled={walletLoading}
                  >
                    {walletLoading ? (
                      <RefreshCw className="spin" size={15} />
                    ) : (
                      <Wallet size={15} />
                    )}
                    {walletLoading ? "Connecting..." : "Connect wallet"}
                  </button>

                  {walletError && (
                    <div className="inline-error">
                      <AlertCircle size={14} />
                      {walletError}
                    </div>
                  )}
                </div>
              )}

              <div className="wallet-safety">
                <ShieldCheck size={14} /> Read-only connection · No signing
                or transactions
              </div>
            </div>
          </section>

          <section className="stats-row">
            <div className="stat-card">
              <div className="stat-icon purple">
                <Wallet size={17} />
              </div>
              <div>
                <span>ASSETS HELD</span>
                <strong>{assets.length}</strong>
                <small>In demo portfolio</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Activity size={17} />
              </div>
              <div>
                <span>ACTIVITY ITEMS</span>
                <strong>{transactions.length}</strong>
                <small>Local demo records</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <Wifi size={17} />
              </div>
              <div>
                <span>WALLET STATUS</span>
                <strong>{wallet ? "Connected" : "Offline"}</strong>
                <small>
                  {wallet ? networkName : "Optional connection"}
                </small>
              </div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="surface-card assets-card" id="assets">
              <div className="section-heading">
                <div>
                  <span className="panel-label">YOUR PORTFOLIO</span>
                  <h2>My assets</h2>
                </div>
                <button
                  className="more-btn"
                  onClick={() =>
                    notify("Asset prices and balances are sample data.")
                  }
                >
                  Sample data <ChevronDown size={14} />
                </button>
              </div>

              <div className="table-head">
                <span>ASSET</span>
                <span>PRICE</span>
                <span>24H</span>
                <span>BALANCE</span>
                <span className="align-right">VALUE</span>
              </div>

              {assets.map((asset) => (
                <div className="asset-row" key={asset.id}>
                  <div className="asset-name">
                    <div
                      className="coin-icon"
                      style={{
                        background: `${asset.color}20`,
                        color: asset.color,
                      }}
                    >
                      {asset.symbol.slice(0, 1)}
                    </div>
                    <div>
                      <strong>{asset.name}</strong>
                      <small>{asset.symbol}</small>
                    </div>
                  </div>

                  <span className="table-price">
                    {formatUSD(asset.priceUsd)}
                  </span>

                  <span
                    className={
                      asset.change24h >= 0 ? "positive" : "negative"
                    }
                  >
                    {asset.change24h >= 0 ? "+" : ""}
                    {asset.change24h.toFixed(2)}%
                  </span>

                  <span className="asset-balance">
                    {formatBalance(asset.balance, asset.symbol)}
                  </span>

                  <strong className="asset-value">
                    {hideBalance
                      ? "••••"
                      : formatUSD(assetValue(asset))}
                  </strong>
                </div>
              ))}

              <div className="asset-footer">
                <span>
                  <ShieldCheck size={14} /> Sample asset balances · not
                  connected to an exchange
                </span>
                <button onClick={() => openAction("buy")}>
                  <span>+</span> Add demo asset
                </button>
              </div>
            </div>

            <div className="surface-card activity-card" id="activity">
              <div className="section-heading">
                <div>
                  <span className="panel-label">PORTFOLIO LOG</span>
                  <h2>Recent activity</h2>
                </div>
                <button
                  className="more-btn"
                  onClick={() => setQuery("")}
                >
                  Clear search
                </button>
              </div>

              <label className="activity-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search activity..."
                />
              </label>

              <div className="activity-list">
                {filteredTransactions.length ? (
                  filteredTransactions.map((tx) => (
                    <div className="activity-item" key={tx.id}>
                      <div className={`activity-icon ${tx.type.toLowerCase()}`}>
                        {tx.type === "Received" ? (
                          <ArrowDownLeft size={16} />
                        ) : tx.type === "Sent" ? (
                          <ArrowUpRight size={16} />
                        ) : tx.type === "Swapped" ? (
                          <ArrowLeftRight size={16} />
                        ) : (
                          <ArrowDownUp size={16} />
                        )}
                      </div>

                      <div className="activity-copy">
                        <strong>
                          {tx.type} {tx.name}
                        </strong>
                        <small>{tx.date}</small>
                      </div>

                      <div className="activity-amount">
                        <strong>{tx.amount}</strong>
                        <small className="status-complete">
                          {tx.status}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    No matching activity found.
                  </div>
                )}
              </div>

              <div className="activity-disclaimer">
                <Clock3 size={13} /> Activity is stored in this browser
                session only.
              </div>
            </div>
          </section>

          <footer className="page-footer">
            <span>© 2026 WalletFlow · Built for learning</span>
            <span>
              <ShieldCheck size={13} /> Demo interface · No real funds moved
            </span>
          </footer>
        </div>
      </main>

      {activeAction && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActiveAction(null);
            }
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-title"
          >
            <div className="modal-head">
              <div>
                <span className="panel-label">
                  LOCAL DEMONSTRATION
                </span>
                <h2 id="action-title">
                  {activeAction[0].toUpperCase() +
                    activeAction.slice(1)}{" "}
                  assets
                </h2>
                <p>
                  This updates only the sample portfolio in your browser.
                </p>
              </div>

              <button
                className="icon-btn"
                onClick={() => setActiveAction(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <label className="field-label" htmlFor="asset-symbol">
                Asset
              </label>

              <div className="select-wrap">
                <select
                  id="asset-symbol"
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                >
                  {assets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.name} ({asset.symbol})
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>

              {activeAction === "swap" && (
                <>
                  <label
                    className="field-label"
                    htmlFor="target-symbol"
                  >
                    Receive asset
                  </label>

                  <div className="select-wrap">
                    <select
                      id="target-symbol"
                      value={targetSymbol}
                      onChange={(event) =>
                        setTargetSymbol(event.target.value)
                      }
                    >
                      {assets.map((asset) => (
                        <option
                          key={asset.symbol}
                          value={asset.symbol}
                        >
                          {asset.name} ({asset.symbol})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </>
              )}

              <label className="field-label" htmlFor="amount-input">
                Amount
              </label>

              <div className="amount-input">
                <input
                  id="amount-input"
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                />
                <span>{symbol}</span>
              </div>

              {activeAction === "send" && (
                <>
                  <label
                    className="field-label"
                    htmlFor="recipient-input"
                  >
                    Demo recipient
                  </label>
                  <input
                    className="text-input"
                    id="recipient-input"
                    value={recipient}
                    onChange={(event) =>
                      setRecipient(event.target.value)
                    }
                    placeholder="Enter a label (e.g. Test account)"
                  />
                </>
              )}

              <div className="fee-note">
                <ShieldCheck size={14} /> No wallet signing, blockchain
                calls, purchases or transfers happen here.
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setActiveAction(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={runDemoAction}
              >
                Update demo
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
