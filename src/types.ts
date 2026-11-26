export type Asset = {
  name: string;
  symbol: string;
  balance: number;
  priceUsd: number;
  changePercent: number;
  icon: string;
  color: string;
};

export type Transaction = {
  id: string;
  name: string;
  symbol: string;
  type: "Received" | "Sent" | "Swapped" | "Bought";
  date: string;
  amount: string;
  status: "Completed" | "Pending";
};
