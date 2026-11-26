import type { Asset, ChartPoint, Transaction } from "./types";

export const initialAssets: Asset[] = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", balance: 2.45, priceUsd: 3240.5, change24h: 2.84, color: "#8b91ff" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", balance: 0.084, priceUsd: 67420, change24h: 1.62, color: "#f4a64a" },
  { id: "usd-coin", name: "USD Coin", symbol: "USDC", balance: 1250, priceUsd: 1, change24h: 0.01, color: "#4b9cf5" },
];

export const initialTransactions: Transaction[] = [
  { id: "tx-1", name: "Ethereum", symbol: "ETH", type: "Received", amount: "+0.42 ETH", date: "Today, 10:42 AM", status: "Completed" },
  { id: "tx-2", name: "Bitcoin", symbol: "BTC", type: "Bought", amount: "+0.015 BTC", date: "Yesterday, 4:18 PM", status: "Completed" },
  { id: "tx-3", name: "USD Coin", symbol: "USDC", type: "Sent", amount: "-120 USDC", date: "Nov 22, 2026", status: "Completed" },
  { id: "tx-4", name: "ETH → USDC", symbol: "USDC", type: "Swapped", amount: "0.15 ETH → 480 USDC", date: "Nov 20, 2026", status: "Completed" },
];

const chartValues: Record<string, number[]> = {
  "1D": [34, 37, 35, 42, 39, 47, 45, 52, 50, 56, 54, 61],
  "1W": [29, 33, 31, 38, 36, 43, 40, 49, 46, 55, 52, 61],
  "1M": [24, 27, 25, 34, 31, 39, 36, 44, 42, 51, 48, 61],
  "3M": [18, 22, 20, 28, 25, 35, 32, 41, 38, 49, 45, 61],
  "1Y": [12, 16, 14, 23, 21, 30, 27, 39, 35, 47, 43, 61],
  ALL: [8, 12, 10, 19, 17, 28, 24, 36, 33, 46, 42, 61],
};

export function getChartData(range: string, total: number): ChartPoint[] {
  const values = chartValues[range] ?? chartValues["1M"];
  const base = Math.max(total * 0.72, 1);
  const labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  return values.map((value, index) => ({
    label: labels[index],
    value: base + (value / 100) * total * 0.28,
  }));
}

export function assetValue(asset: Asset): number {
  return asset.balance * asset.priceUsd;
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function formatBalance(value: number, symbol: string): string {
  const maximumFractionDigits = symbol === "USDC" ? 2 : 6;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value)} ${symbol}`;
}
