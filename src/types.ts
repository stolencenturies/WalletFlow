export type Asset = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  color: string;
};

export type TransactionType = "Received" | "Sent" | "Bought" | "Swapped";

export type Transaction = {
  id: string;
  name: string;
  symbol: string;
  type: TransactionType;
  amount: string;
  date: string;
  status: "Completed" | "Pending";
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type WalletState = {
  address: string;
  chainId: number;
  nativeBalance: string;
};
