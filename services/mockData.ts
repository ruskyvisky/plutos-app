/**
 * Plutos — Mock Finansal Veri
 * Backend hazır olana kadar kullanılacak gerçekçi BIST verileri.
 */

// ─── Türler ──────────────────────────────────────────────────
export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;       // % değişim
  changeAmount: number;  // TL değişim
  volume: number;        // işlem hacmi (lot)
  high: number;
  low: number;
  open: number;
  prevClose: number;
  marketCap: number;     // Piyasa Değeri (milyon TL)
  pe: number;            // F/K
  pb: number;            // PD/DD
  eps: number;           // Hisse başına kâr
  dividendYield: number; // Temettü verimi %
}

export interface IndexData {
  name: string;
  value: number;
  change: number;
  changeAmount: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  symbol?: string;
  category: 'kap' | 'analiz' | 'piyasa' | 'gundem';
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
}

export interface PortfolioData {
  totalBalance: number;
  cash: number;
  totalInvested: number;
  totalPL: number;
  totalPLPercent: number;
  dailyPL: number;
  dailyPLPercent: number;
  holdings: Holding[];
}

// ─── Hisse Verileri ──────────────────────────────────────────
export const MOCK_STOCKS: Stock[] = [
  {
    symbol: 'THYAO',
    name: 'Türk Hava Yolları',
    sector: 'Ulaştırma',
    price: 312.80,
    change: 3.24,
    changeAmount: 9.80,
    volume: 42_580_000,
    high: 315.40,
    low: 301.00,
    open: 303.00,
    prevClose: 303.00,
    marketCap: 431_500,
    pe: 5.8,
    pb: 2.1,
    eps: 53.93,
    dividendYield: 1.2,
  },
  {
    symbol: 'GARAN',
    name: 'Garanti BBVA',
    sector: 'Bankacılık',
    price: 132.50,
    change: 2.17,
    changeAmount: 2.80,
    volume: 78_320_000,
    high: 133.80,
    low: 129.10,
    open: 129.70,
    prevClose: 129.70,
    marketCap: 556_500,
    pe: 4.2,
    pb: 1.4,
    eps: 31.55,
    dividendYield: 3.5,
  },
  {
    symbol: 'ASELS',
    name: 'Aselsan',
    sector: 'Savunma',
    price: 95.70,
    change: 1.48,
    changeAmount: 1.40,
    volume: 35_150_000,
    high: 96.20,
    low: 93.80,
    open: 94.30,
    prevClose: 94.30,
    marketCap: 191_400,
    pe: 28.6,
    pb: 4.8,
    eps: 3.35,
    dividendYield: 0.4,
  },
  {
    symbol: 'EREGL',
    name: 'Ereğli Demir Çelik',
    sector: 'Metal',
    price: 56.45,
    change: -1.83,
    changeAmount: -1.05,
    volume: 28_740_000,
    high: 57.90,
    low: 56.10,
    open: 57.50,
    prevClose: 57.50,
    marketCap: 197_500,
    pe: 9.2,
    pb: 1.1,
    eps: 6.14,
    dividendYield: 6.8,
  },
  {
    symbol: 'SISE',
    name: 'Şişecam',
    sector: 'Cam',
    price: 48.30,
    change: -2.42,
    changeAmount: -1.20,
    volume: 19_870_000,
    high: 49.80,
    low: 47.90,
    open: 49.50,
    prevClose: 49.50,
    marketCap: 121_800,
    pe: 7.3,
    pb: 0.9,
    eps: 6.62,
    dividendYield: 4.2,
  },
  {
    symbol: 'KCHOL',
    name: 'Koç Holding',
    sector: 'Holding',
    price: 192.40,
    change: 0.84,
    changeAmount: 1.60,
    volume: 15_200_000,
    high: 193.50,
    low: 190.00,
    open: 190.80,
    prevClose: 190.80,
    marketCap: 488_700,
    pe: 6.1,
    pb: 1.5,
    eps: 31.54,
    dividendYield: 2.8,
  },
  {
    symbol: 'AKBNK',
    name: 'Akbank',
    sector: 'Bankacılık',
    price: 64.85,
    change: 1.72,
    changeAmount: 1.10,
    volume: 52_300_000,
    high: 65.20,
    low: 63.40,
    open: 63.75,
    prevClose: 63.75,
    marketCap: 337_200,
    pe: 3.8,
    pb: 1.2,
    eps: 17.07,
    dividendYield: 4.1,
  },
  {
    symbol: 'BIMAS',
    name: 'BİM Mağazalar',
    sector: 'Perakende',
    price: 420.60,
    change: -0.52,
    changeAmount: -2.20,
    volume: 5_830_000,
    high: 425.00,
    low: 418.50,
    open: 422.80,
    prevClose: 422.80,
    marketCap: 255_400,
    pe: 21.3,
    pb: 12.8,
    eps: 19.75,
    dividendYield: 1.9,
  },
  {
    symbol: 'TUPRS',
    name: 'Tüpraş',
    sector: 'Enerji',
    price: 175.30,
    change: 2.57,
    changeAmount: 4.40,
    volume: 12_640_000,
    high: 176.80,
    low: 170.10,
    open: 170.90,
    prevClose: 170.90,
    marketCap: 43_800,
    pe: 3.5,
    pb: 1.8,
    eps: 50.09,
    dividendYield: 8.2,
  },
  {
    symbol: 'SAHOL',
    name: 'Sabancı Holding',
    sector: 'Holding',
    price: 87.95,
    change: -0.34,
    changeAmount: -0.30,
    volume: 22_100_000,
    high: 88.80,
    low: 87.20,
    open: 88.25,
    prevClose: 88.25,
    marketCap: 179_600,
    pe: 5.4,
    pb: 0.8,
    eps: 16.29,
    dividendYield: 3.7,
  },
  {
    symbol: 'FROTO',
    name: 'Ford Otosan',
    sector: 'Otomotiv',
    price: 1085.00,
    change: 1.12,
    changeAmount: 12.00,
    volume: 2_360_000,
    high: 1090.00,
    low: 1068.00,
    open: 1073.00,
    prevClose: 1073.00,
    marketCap: 380_750,
    pe: 10.4,
    pb: 5.2,
    eps: 104.33,
    dividendYield: 5.6,
  },
  {
    symbol: 'PGSUS',
    name: 'Pegasus',
    sector: 'Ulaştırma',
    price: 615.20,
    change: -1.95,
    changeAmount: -12.20,
    volume: 4_150_000,
    high: 630.00,
    low: 612.00,
    open: 627.40,
    prevClose: 627.40,
    marketCap: 63_200,
    pe: 8.1,
    pb: 3.7,
    eps: 75.95,
    dividendYield: 0.0,
  },
];

// ─── Endeks Verileri ─────────────────────────────────────────
export const MOCK_INDICES: IndexData[] = [
  { name: 'BIST 100', value: 10_245.32, change: 1.42, changeAmount: 143.56 },
  { name: 'BIST 30', value: 10_876.18, change: 1.58, changeAmount: 169.24 },
  { name: 'BIST Banka', value: 4_532.75, change: 2.14, changeAmount: 94.87 },
  { name: 'Dolar/TL', value: 38.42, change: -0.32, changeAmount: -0.12 },
  { name: 'Euro/TL', value: 41.85, change: -0.18, changeAmount: -0.08 },
  { name: 'Gram Altın', value: 3_245.00, change: 0.95, changeAmount: 30.50 },
];

// ─── Haberler ────────────────────────────────────────────────
export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'BIST 100 Endeksi Güne Yükselişle Başladı',
    summary: 'Borsa İstanbul\'da BIST 100 endeksi, güne yüzde 1.4 yükselişle 10.245 puandan başladı. Bankacılık sektörü pozitif ayrıştı.',
    source: 'Borsa İstanbul',
    date: '2026-03-14T10:30:00',
    category: 'piyasa',
  },
  {
    id: '2',
    title: 'THYAO: 2025 Yılı Kâr Rakamları Açıklandı',
    summary: 'Türk Hava Yolları, 2025 yılında 78.3 milyar TL net kâr açıkladı. Şirket, yolcu sayısını 83.4 milyona çıkardı.',
    source: 'KAP',
    date: '2026-03-14T09:15:00',
    symbol: 'THYAO',
    category: 'kap',
  },
  {
    id: '3',
    title: 'Merkez Bankası Faiz Kararı Beklentileri',
    summary: 'Yatırımcılar, Merkez Bankası\'nın bu haftaki toplantısında 250 baz puan indirim yapmasını bekliyor.',
    source: 'Ekonomi Haberleri',
    date: '2026-03-14T08:00:00',
    category: 'gundem',
  },
  {
    id: '4',
    title: 'Aselsan\'dan Yeni Savunma İhracatı Anlaşması',
    summary: 'Aselsan, Güneydoğu Asya ülkesiyle 1.2 milyar dolarlık savunma ihracatı anlaşması imzaladı.',
    source: 'KAP',
    date: '2026-03-13T16:45:00',
    symbol: 'ASELS',
    category: 'kap',
  },
  {
    id: '5',
    title: 'Bankacılık Sektörü Analiz Raporu',
    summary: 'Yatırım bankalarının ortak görüşüne göre bankacılık sektörünün 2026 yılında yüzde 15-20 aralığında getiri sağlaması bekleniyor.',
    source: 'Uzman Analiz',
    date: '2026-03-13T14:30:00',
    category: 'analiz',
  },
  {
    id: '6',
    title: 'Ereğli Demir Çelik Temettü Dağıtım Kararı',
    summary: 'Ereğli Demir Çelik yönetim kurulu, hisse başına 3.85 TL brüt temettü dağıtılmasını ve dağıtım tarihinin Nisan ortası olarak belirlenmesini kararlaştırdı.',
    source: 'KAP',
    date: '2026-03-13T11:20:00',
    symbol: 'EREGL',
    category: 'kap',
  },
  {
    id: '7',
    title: 'Döviz Piyasasında Son Durum',
    summary: 'Dolar/TL kuru 38.42 seviyesinde işlem görürken, sıkı para politikasının devamı beklentisi TL\'yi destekliyor.',
    source: 'Forex Haberleri',
    date: '2026-03-13T09:00:00',
    category: 'piyasa',
  },
];

// ─── Portföy Verisi ──────────────────────────────────────────
export const MOCK_PORTFOLIO: PortfolioData = {
  totalBalance: 124_350.80,
  cash: 32_540.20,
  totalInvested: 91_810.60,
  totalPL: 8_245.30,
  totalPLPercent: 9.85,
  dailyPL: 1_230.50,
  dailyPLPercent: 1.02,
  holdings: [
    { symbol: 'THYAO', name: 'Türk Hava Yolları', quantity: 100, avgCost: 285.40, currentPrice: 312.80 },
    { symbol: 'GARAN', name: 'Garanti BBVA', quantity: 200, avgCost: 118.30, currentPrice: 132.50 },
    { symbol: 'ASELS', name: 'Aselsan', quantity: 150, avgCost: 88.60, currentPrice: 95.70 },
    { symbol: 'TUPRS', name: 'Tüpraş', quantity: 50, avgCost: 162.80, currentPrice: 175.30 },
    { symbol: 'AKBNK', name: 'Akbank', quantity: 300, avgCost: 59.20, currentPrice: 64.85 },
  ],
};

// ─── Sektörler ───────────────────────────────────────────────
export const SECTORS = [
  'Bankacılık',
  'Ulaştırma',
  'Savunma',
  'Metal',
  'Holding',
  'Enerji',
  'Perakende',
  'Otomotiv',
  'Cam',
] as const;

// ─── Grafik verisi (placeholder fiyat geçmişi) ──────────────
export function generateChartData(basePrice: number, points: number = 30): number[] {
  const data: number[] = [];
  let price = basePrice * 0.92;
  for (let i = 0; i < points; i++) {
    const drift = (Math.random() - 0.48) * basePrice * 0.02;
    price = Math.max(price + drift, basePrice * 0.8);
    data.push(Math.round(price * 100) / 100);
  }
  // Son nokta mevcut fiyata yakın olsun
  data[data.length - 1] = basePrice;
  return data;
}

// ─── Helper Fonksiyonlar ─────────────────────────────────────
export function getTopGainers() {
  return [...MOCK_STOCKS].sort((a, b) => b.change - a.change).slice(0, 5);
}

export function getTopLosers() {
  return [...MOCK_STOCKS].sort((a, b) => a.change - b.change).slice(0, 5);
}

export function getTopVolume() {
  return [...MOCK_STOCKS].sort((a, b) => b.volume - a.volume).slice(0, 5);
}

export function getStockBySymbol(symbol: string): Stock | undefined {
  return MOCK_STOCKS.find((s) => s.symbol === symbol);
}

export function getStocksBySector(sector: string): Stock[] {
  return MOCK_STOCKS.filter((s) => s.sector === sector);
}

export function formatCurrency(value: number): string {
  return '₺' + value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toString();
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(2) + '%';
}
