import { useMemo, useState } from "react";
import {
  ArrowDownLeft, ArrowDownUp, ArrowLeftRight, ArrowUpRight, Bell,
  ChevronDown, CircleHelp, CreditCard, Eye, EyeOff, LayoutDashboard,
  Menu, MoreHorizontal, Plus, Search, Settings, ShieldCheck,
  Sparkles, Wallet, X, TrendingUp, Copy, CheckCircle2
} from "lucide-react";
import { assetValue, formatBalance, formatUSD, initialAssets, initialTransactions } from "./data";
import type { Asset, Transaction } from "./types";
import "./App.css";

type Action = "send" | "receive" | "swap" | "buy" | null;

const currencyOptions = ["ETH", "BTC", "USDC"];

function App() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeAction, setActiveAction] = useState<Action>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");

  const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + assetValue(asset), 0), [assets]);
  const filteredTransactions = transactions.filter((tx) =>
    `${tx.name} ${tx.symbol} ${tx.type}`.toLowerCase().includes(query.toLowerCase())
  );

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const addTransaction = (tx: Omit<Transaction, "id" | "date" | "status">) => {
    setTransactions((current) => [
      { ...tx, id: crypto.randomUUID(), date: "Just now", status: "Completed" },
      ...current,
    ]);
  };

  const updateBalance = (symbol: string, amount: number) => {
    setAssets((current) => current.map((asset) =>
      asset.symbol === symbol ? { ...asset, balance: Math.max(0, asset.balance + amount) } : asset
    ));
  };

  const handleAction = (action: Action, payload: { symbol: string; amount: number; recipient?: string; targetSymbol?: string }) => {
    const source = assets.find((asset) => asset.symbol === payload.symbol);
    if (!source || !Number.isFinite(payload.amount) || payload.amount <= 0) {
      notify("Enter a valid amount.");
      return false;
    }

    if (action === "send") {
      if (source.balance < payload.amount) { notify("Insufficient demo balance."); return false; }
      if (!payload.recipient?.trim()) { notify("Enter a recipient address."); return false; }
      updateBalance(payload.symbol, -payload.amount);
      addTransaction({ name: source.name, symbol: source.symbol, type: "Sent", amount: `-${formatBalance(payload.amount, source.symbol)}` });
      notify("Demo transfer recorded.");
    } else if (action === "receive") {
      updateBalance(payload.symbol, payload.amount);
      addTransaction({ name: source.name, symbol: source.symbol, type: "Received", amount: `+${formatBalance(payload.amount, source.symbol)}` });
      notify("Demo deposit added to your portfolio.");
    } else if (action === "buy") {
      updateBalance(payload.symbol, payload.amount);
      addTransaction({ name: source.name, symbol: source.symbol, type: "Bought", amount: `+${formatBalance(payload.amount, source.symbol)}` });
      notify("Demo purchase added.");
    } else if (action === "swap") {
      const target = assets.find((asset) => asset.symbol === payload.targetSymbol);
      if (!target || source.symbol === target.symbol) { notify("Choose two different assets."); return false; }
      if (source.balance < payload.amount) { notify("Insufficient demo balance."); return false; }
      const output = (payload.amount * source.priceUsd * 0.995) / target.priceUsd;
      setAssets((current) => current.map((asset) => {
        if (asset.symbol === source.symbol) return { ...asset, balance: asset.balance - payload.amount };
        if (asset.symbol === target.symbol) return { ...asset, balance: asset.balance + output };
        return asset;
      }));
      addTransaction({ name: `${source.name} → ${target.name}`, symbol: target.symbol, type: "Swapped", amount: `${formatBalance(payload.amount, source.symbol)} → ${formatBalance(output, target.symbol)}` });
      notify("Demo swap completed (0.5% demo fee).");
    }
    setActiveAction(null);
    return true;
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Wallet size={21} /></div><span>Wallet<span className="brand-accent">Flow</span></span><button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          <button className="nav-item active"><LayoutDashboard size={18}/> Overview</button>
          <button className="nav-item" onClick={() => notify("Assets overview is shown on this dashboard.")}><Wallet size={18}/> My assets</button>
          <button className="nav-item" onClick={() => document.getElementById("activity")?.scrollIntoView({ behavior: "smooth" })}><ArrowLeftRight size={18}/> Transactions</button>
        </nav>
        <div className="workspace-label tools-label">PREFERENCES</div>
        <nav className="nav-list">
          <button className="nav-item" onClick={() => notify("Settings are not connected in this demo.")}><Settings size={18}/> Settings</button>
          <button className="nav-item" onClick={() => notify("Help center coming soon.")}><CircleHelp size={18}/> Help center</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><strong>Make your money flow.</strong><p>Explore your portfolio with a clearer view.</p><button onClick={() => notify("You're already exploring WalletFlow.")}>Explore WalletFlow <ArrowUpRight size={14}/></button></div>
          <div className="profile-row"><div className="avatar">SD</div><div className="profile-copy"><strong>Demo Account</strong><span>Personal workspace</span></div><MoreHorizontal size={19} className="muted-icon"/></div>
        </div>
      </aside>

      {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button><div><span className="breadcrumb-muted">Workspace</span><span className="breadcrumb-slash">/</span><strong>Overview</strong></div></div>
          <div className="topbar-right"><div className="status-pill"><span/> All systems operational</div><button className="icon-btn notification-btn" onClick={() => notify("You're all caught up.")} aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">SD</div></div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row"><div><div className="eyebrow">MONDAY, NOVEMBER 23, 2026</div><h1>Good evening <span>👋</span></h1><p className="subheading">Here's what's happening with your portfolio today.</p></div><div className="welcome-actions"><button className="btn btn-secondary" onClick={() => setActiveAction("receive")}><ArrowDownLeft size={16}/> Receive</button><button className="btn btn-primary" onClick={() => setActiveAction("send")}><ArrowUpRight size={16}/> Send money</button></div></section>

          <section className="overview-grid">
            <div className="balance-panel">
              <div className="panel-top"><span className="panel-label">TOTAL PORTFOLIO VALUE</span><button className="visibility-btn" onClick={() => setHideBalance(!hideBalance)} aria-label="Toggle balance visibility">{hideBalance ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
              <div className="balance-number">{hideBalance ? "••••••••" : formatUSD(totalValue)}</div>
              <div className="balance-change"><span className="change-chip"><TrendingUp size={13}/> 3.24%</span><span>+ $1,284.32 this month</span></div>
              <div className="balance-chart" aria-label="Illustrative portfolio chart"><svg viewBox="0 0 600 125" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity=".3"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/></linearGradient></defs><path d="M0 96 C35 90 42 102 72 82 S115 91 143 67 S184 82 214 58 S253 68 281 49 S322 62 348 39 S390 56 418 34 S456 44 483 27 S529 42 552 18 S580 29 600 8 L600 125 L0 125Z" fill="url(#chartFill)"/><path d="M0 96 C35 90 42 102 72 82 S115 91 143 67 S184 82 214 58 S253 68 281 49 S322 62 348 39 S390 56 418 34 S456 44 483 27 S529 42 552 18 S580 29 600 8" fill="none" stroke="#a78bfa" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/></svg></div>
              <div className="chart-footer"><span>1D</span><span>1W</span><span className="selected">1M</span><span>3M</span><span>1Y</span><span>ALL</span></div>
            </div>
            <div className="quick-panel">
              <div className="quick-heading"><div><span className="panel-label">QUICK ACTIONS</span><h3>Move your money</h3></div><div className="quick-spark"><Sparkles size={17}/></div></div>
              <div className="quick-actions">
                <button onClick={() => setActiveAction("send")}><span className="quick-icon send-icon"><ArrowUpRight size={19}/></span><strong>Send</strong><small>Transfer assets</small></button>
                <button onClick={() => setActiveAction("receive")}><span className="quick-icon receive-icon"><ArrowDownLeft size={19}/></span><strong>Receive</strong><small>Add to wallet</small></button>
                <button onClick={() => setActiveAction("swap")}><span className="quick-icon swap-icon"><ArrowDownUp size={19}/></span><strong>Swap</strong><small>Exchange assets</small></button>
                <button onClick={() => setActiveAction("buy")}><span className="quick-icon buy-icon"><CreditCard size={19}/></span><strong>Buy</strong><small>Get crypto</small></button>
              </div>
              <div className="security-note"><ShieldCheck size={15}/><span>Your demo portfolio is stored locally in this session.</span></div>
            </div>
          </section>

          <section className="stats-row">
            <div className="stat-card"><div className="stat-icon purple"><Wallet size={17}/></div><div><span>Total assets</span><strong>{assets.length.toString().padStart(2,"0")}</strong></div><small>In your portfolio</small></div>
            <div className="stat-card"><div className="stat-icon green"><TrendingUp size={17}/></div><div><span>Portfolio change</span><strong className="positive">+3.24%</strong></div><small>Compared to last month</small></div>
            <div className="stat-card"><div className="stat-icon blue"><ArrowLeftRight size={17}/></div><div><span>Transactions</span><strong>{transactions.length.toString().padStart(2,"0")}</strong></div><small>Activity recorded</small></div>
          </section>

          <section className="lower-grid">
            <div className="surface-card assets-card">
              <div className="section-heading"><div><span className="panel-label">YOUR HOLDINGS</span><h2>My assets</h2></div><button className="text-action" onClick={() => notify("All available demo assets are listed here.")}>View all <ArrowUpRight size={14}/></button></div>
              <div className="asset-table">
                <div className="table-head"><span>ASSET</span><span>PRICE</span><span>24H</span><span>BALANCE</span><span>VALUE</span></div>
                {assets.map((asset) => <div className="asset-row" key={asset.symbol}><div className="asset-name"><div className="coin-icon" style={{ background: `${asset.color}20`, color: asset.color }}>{asset.icon}</div><div><strong>{asset.name}</strong><small>{asset.symbol}</small></div></div><span className="table-price">{formatUSD(asset.priceUsd)}</span><span className={asset.changePercent >= 0 ? "positive" : "negative"}>{asset.changePercent >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%</span><span className="asset-balance">{formatBalance(asset.balance, asset.symbol)}</span><strong className="asset-value">{hideBalance ? "••••" : formatUSD(assetValue(asset))}</strong></div>)}
              </div>
              <div className="asset-footer"><span><span className="live-dot"/> Demo market prices</span><button onClick={() => setActiveAction("buy")}><Plus size={14}/> Add asset</button></div>
            </div>

            <div className="surface-card activity-card" id="activity">
              <div className="section-heading"><div><span className="panel-label">LATEST MOVEMENT</span><h2>Recent activity</h2></div><button className="more-btn" onClick={() => notify("You're viewing all recent demo activity.")}><MoreHorizontal size={20}/></button></div>
              <div className="activity-search"><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search activity..." /></div>
              <div className="activity-list">{filteredTransactions.slice(0,5).map((tx) => <div className="activity-item" key={tx.id}><div className={`activity-icon ${tx.type.toLowerCase()}`}>{tx.type === "Received" ? <ArrowDownLeft size={17}/> : tx.type === "Sent" ? <ArrowUpRight size={17}/> : tx.type === "Swapped" ? <ArrowDownUp size={17}/> : <CreditCard size={17}/>}</div><div className="activity-copy"><strong>{tx.type} {tx.symbol}</strong><small>{tx.date}</small></div><div className="activity-amount"><strong>{tx.amount}</strong><small className={tx.status === "Completed" ? "status-complete" : "status-pending"}>{tx.status}</small></div></div>)}{filteredTransactions.length === 0 && <div className="empty-state">No matching activity found.</div>}</div>
              <button className="activity-all" onClick={() => { setQuery(""); notify("Showing your latest activity."); }}>View transaction history <ArrowUpRight size={14}/></button>
            </div>
          </section>
          <footer className="page-footer"><span>© 2026 WalletFlow. Built for clarity.</span><span><ShieldCheck size={13}/> Demo interface · No real transactions</span></footer>
        </div>
      </main>

      {activeAction && <ActionModal action={activeAction} assets={assets} onClose={() => setActiveAction(null)} onSubmit={handleAction}/>}
      {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={() => setToast("")} aria-label="Dismiss"><X size={14}/></button></div>}
    </div>
  );
}

function ActionModal({ action, assets, onClose, onSubmit }: {
  action: Exclude<Action, null>;
  assets: Asset[];
  onClose: () => void;
  onSubmit: (action: Action, payload: { symbol: string; amount: number; recipient?: string; targetSymbol?: string }) => boolean;
}) {
  const [symbol, setSymbol] = useState(action === "swap" ? "ETH" : "ETH");
  const [targetSymbol, setTargetSymbol] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState(false);
  const asset = assets.find((item) => item.symbol === symbol) ?? assets[0];
  const amountNumber = Number(amount);
  const titles = { send: "Send assets", receive: "Receive assets", swap: "Swap assets", buy: "Buy crypto" };
  const descriptions = {
    send: "Record a simulated transfer from your portfolio.",
    receive: "Add a simulated deposit to your portfolio.",
    swap: "Exchange one demo asset for another.",
    buy: "Add a simulated purchase to your portfolio."
  };
  const submit = () => onSubmit(action, { symbol, amount: amountNumber, recipient, targetSymbol });
  const demoAddress = `walletflow-demo-${symbol.toLowerCase()}-address-0001`;

  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><span className="panel-label">WALLETFLOW ACTION</span><h2 id="modal-title">{titles[action]}</h2><p>{descriptions[action]}</p></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
    <div className="modal-body">
      {action === "receive" && <div className="address-box"><div className="address-qr"><div className="qr-pattern">▦</div></div><span className="field-label">YOUR DEMO {symbol} ADDRESS</span><code>{demoAddress}</code><button className="copy-address" onClick={() => { void navigator.clipboard?.writeText(demoAddress); setCopied(true); }}><Copy size={14}/>{copied ? "Copied" : "Copy address"}</button><small>This is a placeholder address, not a real blockchain address.</small></div>}
      <label className="field-label">ASSET</label><div className="select-wrap"><select value={symbol} onChange={(e) => setSymbol(e.target.value)}>{assets.map((item) => <option key={item.symbol} value={item.symbol}>{item.name} ({item.symbol})</option>)}</select><ChevronDown size={16}/></div>
      <div className="field-label amount-label"><span>AMOUNT</span><span>Available: {formatBalance(asset.balance, asset.symbol)}</span></div><div className="amount-input"><input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"/><span>{symbol}</span></div>
      {action === "send" && <><label className="field-label">RECIPIENT ADDRESS</label><input className="text-input" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Enter demo recipient address"/></>}
      {action === "swap" && <><label className="field-label">YOU RECEIVE</label><div className="select-wrap"><select value={targetSymbol} onChange={(e) => setTargetSymbol(e.target.value)}>{currencyOptions.filter((item) => item !== symbol).map((item) => <option key={item} value={item}>{assets.find((a) => a.symbol === item)?.name} ({item})</option>)}</select><ChevronDown size={16}/></div><div className="fee-note"><ShieldCheck size={14}/> Includes a 0.5% simulated swap fee.</div></>}
      {action === "buy" && <div className="fee-note"><CreditCard size={14}/> Purchase is simulated. No payment method is used.</div>}
    </div>
    <div className="modal-actions"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!amount || amountNumber <= 0} onClick={submit}>{action === "send" ? "Review transfer" : action === "receive" ? "Add demo deposit" : action === "swap" ? "Confirm swap" : "Confirm demo buy"} <ArrowUpRight size={15}/></button></div>
  </div></div>;
}

export default App;
