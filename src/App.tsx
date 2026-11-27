
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
  Trash2,
  Download,
  LogOut,
  AlertTriangle,
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

const PORTFOLIO_STORAGE_KEY = "walletflow:portfolio:v1";

type SavedPortfolio = {
  assets: Asset[];
  transactions: Transaction[];
};

function isAsset(value: unknown): value is Asset {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.symbol === "string" &&
    typeof item.balance === "number" && Number.isFinite(item.balance) && item.balance >= 0 &&
    typeof item.priceUsd === "number" && Number.isFinite(item.priceUsd) && item.priceUsd >= 0 &&
    typeof item.change24h === "number" && Number.isFinite(item.change24h) &&
    typeof item.color === "string"
  );
}

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.symbol === "string" &&
    ["Received", "Sent", "Bought", "Swapped"].includes(String(item.type)) &&
    typeof item.amount === "string" &&
    typeof item.date === "string" &&
    ["Completed", "Pending"].includes(String(item.status))
  );
}

function createRecordId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadPortfolio(): SavedPortfolio {
  try {
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "assets" in parsed &&
        "transactions" in parsed &&
        Array.isArray(parsed.assets) &&
        Array.isArray(parsed.transactions)
      ) {
        const validAssets = parsed.assets.filter(isAsset);
        const validTransactions = parsed.transactions.filter(isTransaction);
        return {
          assets: validAssets.length ? validAssets : initialAssets,
          transactions: validTransactions,
        };
      }
    }
  } catch {
    // If browser storage is unavailable or contains invalid JSON,
    // start with the sample portfolio instead.
  }

  return {
    assets: initialAssets,
    transactions: initialTransactions,
  };
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getWalletErrorMessage(error: unknown) {
  const walletError = error as { code?: number; message?: string };

  switch (walletError?.code) {
    case 4001:
      return "Connection request was rejected in your wallet.";
    case 4100:
      return "Wallet permission was not granted. Check your wallet's connected sites.";
    case 4900:
      return "Your wallet is disconnected from its network. Reopen your wallet and try again.";
    case 4901:
      return "Your wallet is not connected to the selected network.";
    case -32002:
      return "A wallet request is already pending. Open your wallet to respond to it.";
    default:
      return walletError?.message || "Could not connect to the browser wallet. Please try again.";
  }
}

function App() {
  const [savedPortfolio] = useState<SavedPortfolio>(loadPortfolio);
  const [assets, setAssets] = useState<Asset[]>(savedPortfolio.assets);
  const [transactions, setTransactions] =
    useState<Transaction[]>(savedPortfolio.transactions);

  const [activeAction, setActiveAction] = useState<Action>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [transactionType, setTransactionType] =
    useState<"All" | Transaction["type"]>("All");
  const [range, setRange] = useState<ChartRange>("1M");

  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletRefreshing, setWalletRefreshing] = useState(false);
  const [walletAvailable, setWalletAvailable] = useState(Boolean(window.ethereum));
  const [walletError, setWalletError] = useState("");

  const [amount, setAmount] = useState("");
  const [symbol, setSymbol] = useState("ETH");
  const [targetSymbol, setTargetSymbol] = useState("USDC");
  const [recipient, setRecipient] = useState("");
  const [formError, setFormError] = useState("");

  const totalValue = useMemo(
    () => assets.reduce((sum, asset) => sum + assetValue(asset), 0),
    [assets]
  );

  const chartData = useMemo(
    () => getChartData(range, totalValue),
    [range, totalValue]
  );

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = `${tx.name} ${tx.symbol} ${tx.type} ${tx.status}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesType = transactionType === "All" || tx.type === transactionType;
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    try {
      const portfolio: SavedPortfolio = { assets, transactions };
      localStorage.setItem(
        PORTFOLIO_STORAGE_KEY,
        JSON.stringify(portfolio)
      );
    } catch {
      // The app remains usable even if browser storage is unavailable.
    }
  }, [assets, transactions]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const refreshWallet = useCallback(
    async (address?: string, chainId?: number) => {
      if (!window.ethereum) {
        setWalletAvailable(false);
        setWallet(null);
        throw new Error("No browser wallet was detected.");
      }

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
      setWalletError("");
    },
    []
  );

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWalletAvailable(false);
      setWalletError(
        "No browser wallet detected. Install a wallet extension from its official website, then reload WalletFlow."
      );
      return;
    }

    setWalletAvailable(true);
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
      setWalletError(getWalletErrorMessage(error));
    } finally {
      setWalletLoading(false);
    }
  };

  const refreshWalletBalance = async () => {
    setWalletRefreshing(true);
    setWalletError("");

    try {
      await refreshWallet();
      notify("Wallet information refreshed.");
    } catch (error) {
      setWalletError(getWalletErrorMessage(error));
    } finally {
      setWalletRefreshing(false);
    }
  };

  const forgetWallet = () => {
    setWallet(null);
    setWalletError("");
    notify("Wallet disconnected from this dashboard. Site permission may remain in your wallet settings.");
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNav(false);
        setActiveAction(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    setWalletAvailable(Boolean(window.ethereum));
    if (!window.ethereum) return;

    const handleAccounts = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? accounts : [];

      if (!list.length) {
        setWallet(null);
        return;
      }

      void refreshWallet(String(list[0])).catch((error) =>
        setWalletError(getWalletErrorMessage(error))
      );
    };

    const handleChain = () => {
      void refreshWallet().catch((error) =>
        setWalletError(getWalletErrorMessage(error))
      );
    };

    window.ethereum.on?.("accountsChanged", handleAccounts);
    window.ethereum.on?.("chainChanged", handleChain);

    void refreshWallet().catch((error) => {
      setWallet(null);
      setWalletError(getWalletErrorMessage(error));
    });

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
        id: createRecordId(),
        date: "Just now",
        status: "Completed",
      },
      ...current,
    ]);
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== transactionId)
    );
    notify("Activity record deleted. Portfolio balances were not changed.");
  };

  const clearTransactionHistory = () => {
    if (!transactions.length) return;

    const confirmed = window.confirm(
      "Delete all activity records? This will not change your portfolio balances."
    );

    if (!confirmed) return;

    setTransactions([]);
    notify("Activity history cleared.");
  };

  const exportTransactions = () => {
    if (!transactions.length) {
      notify("There are no activity records to export.");
      return;
    }

    const headers = ["Name", "Symbol", "Type", "Amount", "Date", "Status"];
    const rows = transactions.map((tx) => [
      tx.name,
      tx.symbol,
      tx.type,
      tx.amount,
      tx.date,
      tx.status,
    ]);
    const escapeCsv = (value: string) =>
      `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "walletflow-activity.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify("Activity exported as CSV.");
  };

  const runDemoAction = () => {
    setFormError("");

    try {
      const parsedAmount = Number(amount);
      const source = assets.find((asset) => asset.symbol === symbol);

      if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setFormError("Enter an amount greater than zero.");
        return;
      }

      if (!source) {
        setFormError("Choose an asset that exists in your portfolio.");
        return;
      }

      if (!Number.isFinite(source.balance) || source.balance < 0) {
        setFormError("This asset has an invalid demo balance. Reload the page and try again.");
        return;
      }

      if (activeAction === "send") {
        const cleanRecipient = recipient.trim();
        if (cleanRecipient.length < 2 || cleanRecipient.length > 80) {
          setFormError("Enter a demo recipient label between 2 and 80 characters.");
          return;
        }

        if (source.balance < parsedAmount) {
          setFormError("Insufficient demo balance for this action.");
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
      } else if (activeAction === "receive" || activeAction === "buy") {
        updateBalance(symbol, parsedAmount);
        addTransaction({
          name: source.name,
          symbol,
          type: activeAction === "receive" ? "Received" : "Bought",
          amount: `+${formatBalance(parsedAmount, symbol)}`,
        });
        notify("Demo portfolio updated locally.");
      } else if (activeAction === "swap") {
        const target = assets.find((asset) => asset.symbol === targetSymbol);

        if (!target || target.symbol === source.symbol) {
          setFormError("Choose two different assets for the demo swap.");
          return;
        }

        if (source.balance < parsedAmount) {
          setFormError("Insufficient demo balance for this swap.");
          return;
        }

        if (!Number.isFinite(target.priceUsd) || target.priceUsd <= 0 || !Number.isFinite(source.priceUsd) || source.priceUsd <= 0) {
          setFormError("A valid sample price is unavailable for one of these assets.");
          return;
        }

        const output = (parsedAmount * source.priceUsd * 0.995) / target.priceUsd;
        if (!Number.isFinite(output) || output <= 0) {
          setFormError("The demo swap could not calculate a valid output amount.");
          return;
        }

        setAssets((current) =>
          current.map((asset) => {
            if (asset.symbol === source.symbol) {
              return { ...asset, balance: asset.balance - parsedAmount };
            }
            if (asset.symbol === target.symbol) {
              return { ...asset, balance: asset.balance + output };
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
        notify("Demo swap recorded locally. No blockchain transaction occurred.");
      }

      setActiveAction(null);
      setAmount("");
      setRecipient("");
      setFormError("");
    } catch {
      setFormError("Something went wrong while updating the demo portfolio. Your data may not have changed; please try again.");
    }
  };

  const openAction = (action: Action) => {
    setAmount("");
    setRecipient("");
    setFormError("");
    setActiveAction(action);
  };

  const copyAddress = async () => {
    if (!wallet?.address) return;

    try {
      await navigator.clipboard.writeText(wallet.address);
      notify("Wallet address copied.");
    } catch {
      setWalletError("Clipboard access is unavailable. You can select and copy the address manually.");
    }
  };

  const networkName = wallet
    ? supportedNetworks[wallet.chainId] ??
      `Chain ID ${wallet.chainId}`
    : "Not connected";

  return (
    <div className="app-shell">
      <aside
        id="walletflow-sidebar"
        className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
      >
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
          <a className="nav-item active" href="#overview" onClick={() => setMobileNav(false)}>
            <LayoutDashboard size={18} /> Overview
          </a>
          <a className="nav-item" href="#assets" onClick={() => setMobileNav(false)}>
            <Wallet size={18} /> My assets
          </a>
          <a className="nav-item" href="#activity" onClick={() => setMobileNav(false)}>
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
                  {!supportedNetworks[wallet.chainId] && (
                    <div className="inline-error" role="status">
                      <AlertTriangle size={14} />
                      This network is not in WalletFlow's displayed network list. Balance is shown as reported by your wallet.
                    </div>
                  )}
                  {walletError && (
                    <div className="inline-error" role="alert">
                      <AlertCircle size={14} /> {walletError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, width: "100%" }}>
                    <button
                      className="btn btn-secondary wallet-refresh"
                      onClick={() => void refreshWalletBalance()}
                      disabled={walletRefreshing}
                      style={{ flex: 1 }}
                    >
                      <RefreshCw className={walletRefreshing ? "spin" : ""} size={14} />
                      {walletRefreshing ? "Refreshing..." : "Refresh"}
                    </button>
                    <button
                      className="btn btn-secondary wallet-refresh"
                      onClick={forgetWallet}
                      disabled={walletRefreshing}
                      title="Hide this wallet from the dashboard"
                    >
                      <LogOut size={14} /> Forget
                    </button>
                  </div>
                </div>
              ) : (
                <div className="wallet-connect-content">
                  <div className="wallet-illustration">
                    <Wallet size={28} />
                  </div>
                  <h3>{walletAvailable ? "Connect a browser wallet" : "No wallet detected"}</h3>
                  <p>
                    {walletAvailable
                      ? "View your public address, connected network and native balance. WalletFlow uses read-only access and never asks for your recovery phrase."
                      : "Install a compatible browser wallet extension from its official website, then reload this page to connect."}
                  </p>
                  <button
                    className="btn btn-primary connect-btn"
                    onClick={() => void connectWallet()}
                    disabled={walletLoading || !walletAvailable}
                  >
                    {walletLoading ? (
                      <RefreshCw className="spin" size={15} />
                    ) : (
                      <Wallet size={15} />
                    )}
                    {walletLoading ? "Connecting..." : walletAvailable ? "Connect wallet" : "Wallet unavailable"}
                  </button>

                  {walletError && (
                    <div className="inline-error" role="alert">
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
                  <h2>Transaction history</h2>
                  <small style={{ color: "var(--muted, #8b8b9b)" }}>
                    {filteredTransactions.length} of {transactions.length} records
                  </small>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="more-btn" onClick={exportTransactions}>
                    <Download size={14} /> Export CSV
                  </button>
                  <button
                    className="more-btn"
                    onClick={clearTransactionHistory}
                    disabled={!transactions.length}
                    title="Delete all activity records"
                  >
                    <Trash2 size={14} /> Clear history
                  </button>
                </div>
              </div>

              <label className="activity-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, asset, type, or status..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    style={{ border: 0, background: "transparent", color: "inherit", cursor: "pointer" }}
                  >
                    <X size={14} />
                  </button>
                )}
              </label>

              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>
                <label htmlFor="transaction-type-filter" style={{ fontSize: 12, color: "var(--muted, #8b8b9b)" }}>
                  Filter type
                </label>
                <select
                  id="transaction-type-filter"
                  value={transactionType}
                  onChange={(event) =>
                    setTransactionType(event.target.value as "All" | Transaction["type"])
                  }
                  style={{
                    background: "var(--input, rgba(255,255,255,0.06))",
                    color: "inherit",
                    border: "1px solid var(--border, rgba(255,255,255,0.12))",
                    borderRadius: 8,
                    padding: "7px 10px",
                    font: "inherit",
                    fontSize: 12,
                  }}
                >
                  <option value="All">All activity</option>
                  <option value="Received">Received</option>
                  <option value="Sent">Sent</option>
                  <option value="Bought">Bought</option>
                  <option value="Swapped">Swapped</option>
                </select>
              </div>

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

                      <div className="activity-copy" style={{ minWidth: 0, flex: 1 }}>
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

                      <button
                        type="button"
                        onClick={() => deleteTransaction(tx.id)}
                        aria-label={`Delete ${tx.type} ${tx.name} record`}
                        title="Delete this activity record"
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "var(--muted, #8b8b9b)",
                          cursor: "pointer",
                          padding: 7,
                          marginLeft: 4,
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    {transactions.length
                      ? "No activity matches your search or filter."
                      : "No activity records yet. Your demo transactions will appear here."}
                  </div>
                )}
              </div>

              <div className="activity-disclaimer">
                <Clock3 size={13} /> Activity is saved locally. Deleting records does not change portfolio balances.
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
                  onChange={(event) => {
                    setSymbol(event.target.value);
                    setFormError("");
                  }}
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
                      onChange={(event) => {
                        setTargetSymbol(event.target.value);
                        setFormError("");
                      }}
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
                  required
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setFormError("");
                  }}
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
                    maxLength={80}
                    value={recipient}
                    onChange={(event) => {
                      setRecipient(event.target.value);
                      setFormError("");
                    }}
                    placeholder="Enter a label (e.g. Test account)"
                  />
                </>
              )}

              {formError && (
                <div className="inline-error" role="alert" style={{ marginTop: 12 }}>
                  <AlertCircle size={14} /> {formError}
                </div>
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
