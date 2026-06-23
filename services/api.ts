/**
 * Plutos — API Service Layer
 * FastAPI backend'e bağlı gerçek HTTP çağrıları.
 *
 * Fiziksel cihazda test ediyorsanız BASE_URL'yi
 * bilgisayarınızın yerel ağ IP'siyle değiştirin:
 *   örn: http://192.168.1.42:8000
 */

import type { IndexData, Stock } from './mockData';
export type { IndexData, Stock } from './mockData';
export type { NewsItem, PortfolioData, Holding } from './mockData';

// ─── Konfigürasyon ───────────────────────────────────────────
// .env dosyasındaki EXPO_PUBLIC_API_URL değişkenini kullanır.
// Fiziksel cihazda test için .env'i güncelleyin:
//   EXPO_PUBLIC_API_URL=http://192.168.1.42:8000/api/v1
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

// ─── Backend ham tipleri ──────────────────────────────────────

interface BackendStockData {
  symbol: string;
  price: number;
  change_percentage: number;
  volume: number;
}

interface BackendIndexData {
  index_name: string;
  value: number;
  change_percentage: number;
}

interface BackendOHLCVResponse {
  symbol: string;
  period: string;
  interval: string;
  period_change_percent: number;
  data: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
}

interface BackendCompanyProfile {
  symbol: string;
  name?: string;
  sector?: string;
  industry?: string;
  website?: string;
  description?: string;
  metrics?: {
    symbol: string;
    price?: number;
    change_percent?: number;
    market_cap?: number;
    pe_ratio?: number;
    pb_ratio?: number;
    eps?: number;
    dividend_yield?: number;
    fifty_two_week_high?: number;
    fifty_two_week_low?: number;
    beta?: number;
  };
  dividends: { date: string; dividend: number }[];
}

interface BackendNewsItem {
  date: string;
  title: string;
  url: string;
}

// ─── Adaptör fonksiyonlar ─────────────────────────────────────

function adaptStock(s: BackendStockData): Stock {
  return {
    symbol: s.symbol,
    name: s.symbol,          // backend /market/all çağrısından isim gelecek
    sector: '',
    price: s.price,
    change: s.change_percentage,
    changeAmount: (s.price * s.change_percentage) / 100,
    volume: s.volume,
    high: 0,
    low: 0,
    open: 0,
    prevClose: 0,
    marketCap: 0,
    pe: 0,
    pb: 0,
    eps: 0,
    dividendYield: 0,
  };
}

function adaptIndex(idx: BackendIndexData): IndexData {
  return {
    name: idx.index_name,
    value: idx.value,
    change: idx.change_percentage,
    changeAmount: (idx.value * idx.change_percentage) / 100,
  };
}

// ─── Market API ──────────────────────────────────────────────

export async function fetchIndices(): Promise<IndexData[]> {
  try {
    const data = await apiFetch<BackendIndexData[]>('/indices/');
    return data.map(adaptIndex);
  } catch (e) {
    console.error('fetchIndices error:', e);
    return [];
  }
}

export async function fetchTopGainers(): Promise<Stock[]> {
  try {
    const data = await apiFetch<BackendStockData[]>('/market/top-gainers');
    return data.map(adaptStock);
  } catch (e) {
    console.error('fetchTopGainers error:', e);
    return [];
  }
}

export async function fetchTopLosers(): Promise<Stock[]> {
  try {
    const data = await apiFetch<BackendStockData[]>('/market/top-losers');
    return data.map(adaptStock);
  } catch (e) {
    console.error('fetchTopLosers error:', e);
    return [];
  }
}

export async function fetchTopVolume(): Promise<Stock[]> {
  try {
    const data = await apiFetch<BackendStockData[]>('/market/high-volume');
    return data.map(adaptStock);
  } catch (e) {
    console.error('fetchTopVolume error:', e);
    return [];
  }
}

export async function fetchAllStocks(): Promise<Stock[]> {
  try {
    // /market/all -> { ticker, name, sector, city }[]
    const data = await apiFetch<{ ticker: string; name?: string; sector?: string }[]>('/market/all');
    return data.map((s) => ({
      symbol: s.ticker,
      name: s.name ?? s.ticker,
      sector: s.sector ?? '',
      price: 0,
      change: 0,
      changeAmount: 0,
      volume: 0,
      high: 0,
      low: 0,
      open: 0,
      prevClose: 0,
      marketCap: 0,
      pe: 0,
      pb: 0,
      eps: 0,
      dividendYield: 0,
    }));
  } catch (e) {
    console.error('fetchAllStocks error:', e);
    return [];
  }
}

// ─── Stock Detail API ────────────────────────────────────────

export async function fetchStockDetail(symbol: string): Promise<Stock | null> {
  try {
    const profile = await apiFetch<BackendCompanyProfile>(`/market/profile/${symbol}`);
    const m = profile.metrics;
    return {
      symbol: profile.symbol,
      name: profile.name ?? symbol,
      sector: profile.sector ?? '',
      price: m?.price ?? 0,
      change: m?.change_percent ?? 0,
      changeAmount: m?.price && m?.change_percent ? (m.price * m.change_percent) / 100 : 0,
      volume: 0,
      high: m?.fifty_two_week_high ?? 0,
      low: m?.fifty_two_week_low ?? 0,
      open: 0,
      prevClose: 0,
      marketCap: m?.market_cap ?? 0,
      pe: m?.pe_ratio ?? 0,
      pb: m?.pb_ratio ?? 0,
      eps: m?.eps ?? 0,
      dividendYield: m?.dividend_yield ?? 0,
    };
  } catch (e) {
    console.error('fetchStockDetail error:', e);
    return null;
  }
}

export async function fetchChartData(
  symbol: string,
  timeframe: '1G' | '1H' | '1A' | '1Y' = '1A'
): Promise<number[]> {
  try {
    const data = await apiFetch<BackendOHLCVResponse>(
      `/market/ohlcv/${symbol}?period=${timeframe}`
    );
    return data.data.map((d) => d.close);
  } catch (e) {
    console.error('fetchChartData error:', e);
    return [];
  }
}

export async function fetchStocksBySector(sector: string): Promise<Stock[]> {
  // Backend'de sektör filtresi yok; tüm hisseleri çekip filtrele
  try {
    const all = await fetchAllStocks();
    return sector ? all.filter((s) => s.sector === sector) : all;
  } catch (e) {
    console.error('fetchStocksBySector error:', e);
    return [];
  }
}

// ─── Portfolio API ───────────────────────────────────────────

import type { PortfolioData } from './mockData';

interface BackendHolding {
  symbol: string;
  name: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
}

interface BackendPortfolio {
  total_balance: number;
  cash: number;
  total_invested: number;
  total_pl: number;
  total_pl_percent: number;
  daily_pl: number;
  daily_pl_percent: number;
  holdings: BackendHolding[];
}

export async function fetchPortfolio(): Promise<PortfolioData> {
  try {
    const data = await apiFetch<BackendPortfolio>('/portfolio/');
    return {
      totalBalance: data.total_balance,
      cash: data.cash,
      totalInvested: data.total_invested,
      totalPL: data.total_pl,
      totalPLPercent: data.total_pl_percent,
      dailyPL: data.daily_pl,
      dailyPLPercent: data.daily_pl_percent,
      holdings: data.holdings.map((h) => ({
        symbol: h.symbol,
        name: h.name,
        quantity: h.quantity,
        avgCost: h.avg_cost,
        currentPrice: h.current_price,
      })),
    };
  } catch (e) {
    console.error('fetchPortfolio error:', e);
    return {
      totalBalance: 0,
      cash: 100_000,
      totalInvested: 0,
      totalPL: 0,
      totalPLPercent: 0,
      dailyPL: 0,
      dailyPLPercent: 0,
      holdings: [],
    };
  }
}

export async function executeTrade(
  symbol: string,
  quantity: number,
  type: 'buy' | 'sell'
): Promise<{ success: boolean; message: string }> {
  try {
    const params = new URLSearchParams({
      symbol,
      quantity: String(quantity),
      trade_type: type,
    });
    const response = await fetch(`${BASE_URL}/portfolio/trade?${params}`, {
      method: 'POST',
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.detail ?? 'İşlem başarısız.' };
    }
    return data as { success: boolean; message: string };
  } catch (e) {
    console.error('executeTrade error:', e);
    return { success: false, message: 'Sunucuya ulaşılamadı.' };
  }
}

// ─── News API ────────────────────────────────────────────────

import type { NewsItem } from './mockData';

interface BackendGeneralNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  symbol?: string;
  url?: string;
  category: string;
}

export async function fetchNews(category?: string): Promise<NewsItem[]> {
  try {
    // Genel haberler: backend'deki /portfolio/news/general endpoint'ini kullan
    const data = await apiFetch<BackendGeneralNews[]>('/portfolio/news/general?limit=40');
    const mapped: NewsItem[] = data.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary || n.title,
      source: n.source,
      date: n.date,
      symbol: n.symbol,
      category: (n.category as NewsItem['category']) ?? 'kap',
    }));
    // Kategori filtresi
    if (category && category !== 'all') {
      return mapped.filter((n) => n.category === category);
    }
    return mapped;
  } catch (e) {
    console.error('fetchNews error:', e);
    return [];
  }
}

// ─── Search API ──────────────────────────────────────────────

export async function searchStocks(query: string): Promise<Stock[]> {
  try {
    const data = await apiFetch<{ ticker: string; name?: string; sector?: string }[]>(
      `/market/search?q=${encodeURIComponent(query)}`
    );
    return data.map((s) => ({
      symbol: s.ticker,
      name: s.name ?? s.ticker,
      sector: s.sector ?? '',
      price: 0,
      change: 0,
      changeAmount: 0,
      volume: 0,
      high: 0,
      low: 0,
      open: 0,
      prevClose: 0,
      marketCap: 0,
      pe: 0,
      pb: 0,
      eps: 0,
      dividendYield: 0,
    }));
  } catch (e) {
    console.error('searchStocks error:', e);
    return [];
  }
}
