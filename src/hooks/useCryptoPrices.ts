import { useState, useEffect } from 'react';

const DEFAULT_PRICES: Record<string, number> = {
  USDT: 1,
  USDT_TRC20: 1,
  BTC: 0,
  ETH: 0,
  LTC: 0,
};

let cachedPrices: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60000; // 1 minute cache

export function useCryptoPrices() {
  const [prices, setPrices] = useState<Record<string, number>>(cachedPrices || DEFAULT_PRICES);
  const [isLoading, setIsLoading] = useState(!cachedPrices);

  useEffect(() => {
    const now = Date.now();
    if (cachedPrices && now - lastFetchTime < CACHE_DURATION_MS) {
      setPrices(cachedPrices);
      setIsLoading(false);
      return;
    }

    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,tether&vs_currencies=usd'
        );
        if (response.ok) {
          const data = await response.json();
          const newPrices: Record<string, number> = {
            USDT: data.tether?.usd || 1,
            USDT_TRC20: data.tether?.usd || 1,
            BTC: data.bitcoin?.usd || 0,
            ETH: data.ethereum?.usd || 0,
            LTC: data.litecoin?.usd || 0,
          };
          cachedPrices = newPrices;
          lastFetchTime = Date.now();
          setPrices(newPrices);
        }
      } catch (err) {
        console.error('Failed to fetch crypto prices:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return { prices, isLoading };
}
