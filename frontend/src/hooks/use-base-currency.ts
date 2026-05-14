import { useCurrencies } from "./use-currencies";

export function useBaseCurrency() {
  const { data: currencies } = useCurrencies();
  const base = currencies?.find((c) => c.isBase);
  return base;
}
