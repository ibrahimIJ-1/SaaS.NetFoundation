import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Currency } from "@/types/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency?: Currency): string {
  const symbol = currency?.symbol || "";
  return `${amount.toLocaleString('ar-IQ')} ${symbol}`.trim();
}

export function toBaseCurrency(amount: number, exchangeRate: number): number {
  return amount * exchangeRate;
}
