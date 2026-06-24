import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchIndices } from '@/services/api';

export type CurrencyType = 'TRY' | 'USD' | 'EUR';

interface CurrencyContextData {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  convertPrice: (price: number, symbol?: string) => number;
  formatPrice: (price: number, symbol?: string) => string;
  usdTryRate: number;
  eurTryRate: number;
}

const CurrencyContext = createContext<CurrencyContextData | undefined>(undefined);

export function isUsdAsset(symbol?: string): boolean {
  if (!symbol) return false;
  const s = symbol.toUpperCase();
  // Crypto or commodities (BTC-USD, GC=F, SI=F, etc.)
  return s.endsWith('-USD') || s.endsWith('=F') || s.includes('-') || s === 'BTC' || s === 'ETH' || s === 'SOL';
}

export function isIndexPoint(symbol?: string): boolean {
  if (!symbol) return false;
  const s = symbol.toUpperCase();
  return s === 'XU100' || s === 'XU030';
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyType>('TRY');
  const [usdTryRate, setUsdTryRate] = useState<number>(32.5);
  const [eurTryRate, setEurTryRate] = useState<number>(35.2);

  const fetchRates = async () => {
    try {
      const indices = await fetchIndices();
      const dolarIndex = indices.find(idx => idx.name === 'Dolar/TL');
      const euroIndex = indices.find(idx => idx.name === 'Euro/TL');
      
      if (dolarIndex && dolarIndex.value > 0) {
        setUsdTryRate(dolarIndex.value);
      }
      if (euroIndex && euroIndex.value > 0) {
        setEurTryRate(euroIndex.value);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  useEffect(() => {
    fetchRates();
    // Poll exchange rates every 2 minutes
    const interval = setInterval(fetchRates, 120000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
  };

  const convertPrice = (price: number, symbol?: string): number => {
    if (isIndexPoint(symbol)) {
      return price; // index points do not convert
    }

    const assetInUsd = isUsdAsset(symbol);

    if (currency === 'TRY') {
      // If asset is USD (Crypto/Commodity), scale to TRY
      return assetInUsd ? price * usdTryRate : price;
    } else if (currency === 'USD') {
      // If asset is TRY (BIST), divide to USD
      return assetInUsd ? price : price / usdTryRate;
    } else { // EUR
      // Convert to EUR
      return assetInUsd ? price * (usdTryRate / eurTryRate) : price / eurTryRate;
    }
  };

  const formatPrice = (price: number, symbol?: string): string => {
    if (isIndexPoint(symbol)) {
      return price.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    const converted = convertPrice(price, symbol);

    if (currency === 'TRY') {
      return `₺${converted.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else if (currency === 'USD') {
      return `$${converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else { // EUR
      return `€${converted.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice, usdTryRate, eurTryRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
