import type { Asset, Transaction } from "./types";

export const initialAssets: Asset[] = [
  { name: "Ethereum", symbol: "ETH", balance: 2.45, priceUsd: 3365.55, changePercent: 4.32, icon: "Ξ", color: "#8b9cff" },
  { name: "Bitcoin", symbol: "BTC", balance: 0.084, priceUsd: 64526.19, changePercent: 2.18, icon: "₿", color: "#f5a94b" },
  { name: "USD Coin", symbol: "USDC", balance: 1250, priceUsd: 1, changePercent: 0.01, icon: "$", color: "#4b9cf5" },
];

export const initialTransactions: Transaction[] = [
  { id: "tx-1", name: "Ethereum", symbol: "ETH", type: "Received", date: "Today, 10:42 AM", amount: "+0.25 ETH", status: "Completed" },
  { id: "tx-2", name: "Bitcoin", symbol: "BTC", type: "Sent", date: "Yesterday, 4:18 PM", amount: "-0.012 BTC", status: "Completed" },
  { id: "tx-3", name: "USD Coin", symbol: "USDC", type: "Received", date: "Nov 17, 2026", amount: "+250 USDC", status: "Pending" },
  { id: "tx-4", name: "Ethereum", symbol: "ETH", type: "Bought", date: "Nov 15, 2026", amount: "+0.08 ETH", status: "Completed" },
];

export const formatUSD = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatBalance = (value: number, symbol: string) =>
  `${value.toLocaleString("en-US", { maximumFractionDigits: symbol === "USDC" ? 2 : 8 })} ${symbol}`;

export const assetValue = (asset: Asset) => asset.balance * asset.priceUsd;
