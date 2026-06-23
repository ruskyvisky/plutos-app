from pydantic import BaseModel
from typing import List, Optional

class StockData(BaseModel):
    symbol: str
    price: float
    change_percentage: float
    volume: float

class CompanyShort(BaseModel):
    ticker: str
    name: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None

class IndexData(BaseModel):
    index_name: str
    value: float
    change_percentage: float

class OHLCVData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class FundamentalMetrics(BaseModel):
    symbol: str
    price: Optional[float] = None
    change_percent: Optional[float] = None
    change_amount: Optional[float] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None  # trailingPE
    pb_ratio: Optional[float] = None  # priceToBook
    eps: Optional[float] = None       # trailingEps
    enterprise_to_ebitda: Optional[float] = None
    net_debt: Optional[float] = None
    float_shares: Optional[float] = None
    foreign_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    fifty_day_average: Optional[float] = None
    two_hundred_day_average: Optional[float] = None
    beta: Optional[float] = None
    # Daily OHLC
    volume: Optional[float] = None
    open_price: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    prev_close: Optional[float] = None
    # Tavan / Taban (BIST: ±%10 günlük limit)
    upper_limit: Optional[float] = None
    lower_limit: Optional[float] = None

class DividendData(BaseModel):
    date: str
    dividend: float

class OHLCVResponse(BaseModel):
    symbol: str
    period: str
    interval: str
    period_change_percent: float
    data: List[OHLCVData]

class CompanyProfile(BaseModel):
    symbol: str
    name: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    metrics: Optional[FundamentalMetrics] = None
    dividends: List[DividendData] = []

class NewsData(BaseModel):
    date: str
    title: str
    url: str

class CalendarEvent(BaseModel):
    date: str
    time: Optional[str] = None
    country: str
    importance: str
    event: str
    actual: Optional[str] = None
    forecast: Optional[str] = None
    previous: Optional[str] = None

class MarketOverviewResponse(BaseModel):
    top_gainers: List[StockData]
    top_losers: List[StockData]
    high_volume: List[StockData]
    indices: List[IndexData]

class Holding(BaseModel):
    symbol: str
    name: str
    quantity: int
    avg_cost: float
    current_price: float

class PortfolioData(BaseModel):
    total_balance: float
    cash: float
    total_invested: float
    total_pl: float
    total_pl_percent: float
    daily_pl: float
    daily_pl_percent: float
    holdings: List[Holding]

class GeneralNewsItem(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    date: str
    symbol: Optional[str] = None
    url: Optional[str] = None
    category: str = "piyasa"
