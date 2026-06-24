import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from typing import Dict, Any, List

from app.core.config import settings
from app.services.market_data import market_service

logger = logging.getLogger(__name__)

class MarketDataCache:
    """
    Basit bir in-memory cache mekanizması (Redis yerine standalone çalışabilmesi için).
    """
    data: Dict[str, Any] = {
        "top_gainers": [],
        "top_losers": [],
        "high_volume": [],
        "crypto": [],
        "commodities": [],
        "all_stocks": []
    }
    indices: Dict[str, Any] = {}

market_cache = MarketDataCache()

def classify_sector(symbol: str, name: str) -> str:
    symbol_upper = symbol.upper()
    name_upper = name.upper()
    
    # Banking
    banking_syms = ["AKBNK", "ALBRK", "GARAN", "HALKB", "ISCTR", "KLNMA", "QNB", "TSKB", "VAKBN", "YKBNK", "ICBCT"]
    if any(s in symbol_upper for s in banking_syms) or "BANK" in name_upper or "KATILIM" in name_upper:
        return "Bankacılık"
        
    # Energy
    energy_syms = ["ENJS", "ODAS", "AKSEN", "ZOREN", "AYDEM", "GWIND", "CONSE", "HUNER", "ALFAS", "YEOTK", "SMRTG", "ASTOR", "EUPWR", "CATES", "ENTRA", "BRSAN", "CWENE"]
    if any(s in symbol_upper for s in energy_syms) or "ENERJ" in name_upper or "ELEKTR" in name_upper or "SOLAR" in name_upper or "RUZGAR" in name_upper:
        return "Enerji"
        
    # Transportation
    trans_syms = ["THYAO", "PGSUS", "TAVHL", "DOCO", "CLEBI", "RYGYO", "GSDDE"]
    if any(s in symbol_upper for s in trans_syms) or "HAVA" in name_upper or "ULASTIRMA" in name_upper or "TASIMACILIK" in name_upper or "LOJISTIK" in name_upper or "DENIZ" in name_upper:
        return "Ulaştırma"
        
    # Retail
    retail_syms = ["BIMAS", "SOKM", "MGROS", "CRFSA", "TKNSA", "MAVI", "VAKKO", "DOAS"]
    if any(s in symbol_upper for s in retail_syms) or "MAGAZA" in name_upper or "MARKET" in name_upper or "PERAKENDE" in name_upper or "TEKSTIL" in name_upper or "GIYIM" in name_upper:
        return "Perakende"
        
    return "Sanayi" # default sector

def fetch_and_cache_market_data():
    """
    Borsapy'den BIST, yfinance'den Kripto/Emtia verilerini çekip in-memory cache'i güncelleyen fonksiyon.
    """
    try:
        logger.info("Market verisi çekiliyor...")
        
        # 1. BIST screener ile tüm BIST fiyatlarını ve değişimlerini çek (Çok hızlı, ~0.3s)
        import borsapy as bp
        s = bp.Screener()
        s.add_filter("price", min=0)
        s.add_filter("return_1d", min=-100)
        screener_df = s.run()
        
        screener_dict = {}
        for _, row in screener_df.iterrows():
            sym = row['symbol']
            price = float(row.get('criteria_7') or 0.0)
            change = float(row.get('criteria_21') or 0.0)
            screener_dict[sym] = {"price": price, "change": change}
            
        # 2. Tüm BIST referans listesini al ve map'le
        all_companies = bp.companies()
        bist_stocks = []
        for _, row in all_companies.iterrows():
            ticker = row['ticker']
            name = row.get('name') or ticker
            sector = classify_sector(ticker, name)
            sc_data = screener_dict.get(ticker, {"price": 0.0, "change": 0.0})
            
            bist_stocks.append({
                "ticker": ticker,
                "name": name,
                "sector": sector,
                "price": sc_data["price"],
                "change": sc_data["change"],
                "volume": 0.0
            })
            
        market_cache.data["all_stocks"] = bist_stocks
        
        # 3. Günün en çok yükselenler, düşenler, hacimlileri (BIST30 popüler hisseleri üzerinden)
        pop_tickers = ["THYAO", "ASELS", "TUPRS", "SASA", "HEKTS", 
                       "GARAN", "AKBNK", "YKBNK", "EREGL", "KCHOL",
                       "SISE", "BIMAS", "ISCTR", "PGSUS", "TCELL"]
        bist30_data = []
        for sym in pop_tickers:
            if sym in screener_dict:
                bist30_data.append({
                    "symbol": sym,
                    "price": screener_dict[sym]["price"],
                    "change_percentage": screener_dict[sym]["change"],
                    "volume": 0.0
                })
        
        market_cache.data["top_gainers"] = sorted(bist30_data, key=lambda x: x["change_percentage"], reverse=True)[:5]
        market_cache.data["top_losers"] = sorted(bist30_data, key=lambda x: x["change_percentage"])[:5]
        market_cache.data["high_volume"] = bist30_data[:5]
        
        # 4. Yfinance ile Crypto ve Commodities verilerini çek
        import yfinance as yf
        crypto_tickers = {
            "BTC-USD": "Bitcoin",
            "ETH-USD": "Ethereum",
            "SOL-USD": "Solana",
            "BNB-USD": "BNB",
            "XRP-USD": "XRP",
            "DOGE-USD": "Dogecoin",
            "ADA-USD": "Cardano",
            "AVAX-USD": "Avalanche",
            "TRX-USD": "TRON",
            "LINK-USD": "Chainlink"
        }
        
        commodity_tickers = {
            "GC=F": "Gram Altın",
            "SI=F": "Gram Gümüş",
            "CL=F": "Ham Petrol (Varil Fiyatı)",
            "BZ=F": "Brent Petrol (Varil Fiyatı)",
            "HG=F": "Bakır",
            "PL=F": "Platin",
            "PA=F": "Paladyum",
            "NG=F": "Doğalgaz"
        }
        
        all_yf_tickers = list(crypto_tickers.keys()) + list(commodity_tickers.keys())
        yf_df = yf.download(all_yf_tickers, period="2d", interval="1d", group_by="ticker", progress=False)
        
        # Kripto listesi
        crypto_list = []
        for t, name in crypto_tickers.items():
            price = 0.0
            change = 0.0
            if t in yf_df.columns.levels[0]:
                closes = yf_df[t]['Close'].dropna()
                if len(closes) >= 2:
                    price = float(closes.iloc[-1])
                    prev = float(closes.iloc[-2])
                    change = ((price - prev) / prev * 100) if prev else 0.0
                elif len(closes) == 1:
                    price = float(closes.iloc[0])
            crypto_list.append({
                "ticker": t,
                "name": name,
                "price": price,
                "change": change,
                "sector": "Kripto"
            })
        market_cache.data["crypto"] = crypto_list
        
        # Emtia listesi
        commodity_list = []
        for t, name in commodity_tickers.items():
            price = 0.0
            change = 0.0
            if t in yf_df.columns.levels[0]:
                closes = yf_df[t]['Close'].dropna()
                if len(closes) >= 2:
                    price = float(closes.iloc[-1])
                    prev = float(closes.iloc[-2])
                    change = ((price - prev) / prev * 100) if prev else 0.0
                elif len(closes) == 1:
                    price = float(closes.iloc[0])
            
            if t in ("GC=F", "SI=F"):
                price = price / 31.10347
                
            commodity_list.append({
                "ticker": t,
                "name": name,
                "price": price,
                "change": change,
                "sector": "Emtia"
            })
        market_cache.data["commodities"] = commodity_list
        
        # 5. Endeksler ve Pariteler
        overview = market_service.get_market_overview()
        indices_data = overview.get("indices", [])
        for idx in indices_data:
            market_cache.indices[idx["index_name"]] = idx
            
        logger.info("Market veri cache'i başarıyla güncellendi.")
    except Exception as e:
        logger.error(f"Seeder hata aldı: {e}")

def start_scheduler():
    """
    Uygulama başladığında APScheduler'ı ayağa kaldırır ve job'ları kaydeder.
    """
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=fetch_and_cache_market_data,
        trigger=IntervalTrigger(minutes=settings.SEEDER_INTERVAL_MINUTES),
        id="market_data_seeder",
        name="Market Data Background Seeder",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Seeder scheduler başlatıldı.")
    
    # İlk veriyi çek
    fetch_and_cache_market_data()
