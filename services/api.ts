/**
 * Plutos — API Service Layer (Stub)
 * Backend hazır olduğunda sadece bu dosyadaki fetch çağrılarını değiştireceksiniz.
 */

import {
  MOCK_INDICES,
  MOCK_NEWS,
  MOCK_PORTFOLIO,
  MOCK_STOCKS,
  generateChartData,
  getStockBySymbol,
  getStocksBySector,
  getTopGainers,
  getTopLosers,
  getTopVolume,
  type IndexData,
  type NewsItem,
  type PortfolioData,
  type Stock,
} from './mockData';

// Simüle edilmiş API gecikmesi
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const API_DELAY = 600; // ms

// ─── Market API ──────────────────────────────────────────────

export async function fetchIndices(): Promise<IndexData[]> {
  await delay(API_DELAY);
  return MOCK_INDICES;
}

export async function fetchAllStocks(): Promise<Stock[]> {
  await delay(API_DELAY);
  return MOCK_STOCKS;
}

export async function fetchTopGainers(): Promise<Stock[]> {
  await delay(API_DELAY);
  return getTopGainers();
}

export async function fetchTopLosers(): Promise<Stock[]> {
  await delay(API_DELAY);
  return getTopLosers();
}

export async function fetchTopVolume(): Promise<Stock[]> {
  await delay(API_DELAY);
  return getTopVolume();
}

// ─── Stock Detail API ────────────────────────────────────────

export async function fetchStockDetail(symbol: string): Promise<Stock | null> {
  await delay(API_DELAY);
  return getStockBySymbol(symbol) ?? null;
}

export async function fetchChartData(
  symbol: string,
  _timeframe: '1G' | '1H' | '1A' | '1Y' = '1A'
): Promise<number[]> {
  await delay(API_DELAY);
  const stock = getStockBySymbol(symbol);
  if (!stock) return [];
  const pointsMap = { '1G': 24, '1H': 30, '1A': 30, '1Y': 52 };
  return generateChartData(stock.price, pointsMap[_timeframe]);
}

export async function fetchStocksBySector(sector: string): Promise<Stock[]> {
  await delay(API_DELAY);
  return getStocksBySector(sector);
}

// ─── Portfolio API ───────────────────────────────────────────

export async function fetchPortfolio(): Promise<PortfolioData> {
  await delay(API_DELAY);
  return MOCK_PORTFOLIO;
}

export async function executeTrade(
  _symbol: string,
  _quantity: number,
  _type: 'buy' | 'sell'
): Promise<{ success: boolean; message: string }> {
  await delay(1000);
  return { success: true, message: 'İşlem başarıyla gerçekleştirildi.' };
}

// ─── News API ────────────────────────────────────────────────

export async function fetchNews(category?: string): Promise<NewsItem[]> {
  await delay(API_DELAY);
  if (category && category !== 'all') {
    return MOCK_NEWS.filter((n) => n.category === category);
  }
  return MOCK_NEWS;
}

// ─── Search API ──────────────────────────────────────────────

export async function searchStocks(query: string): Promise<Stock[]> {
  await delay(300);
  const q = query.toUpperCase();
  return MOCK_STOCKS.filter(
    (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q)
  );
}
