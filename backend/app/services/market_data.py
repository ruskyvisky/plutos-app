import logging
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime
import borsapy as bp

logger = logging.getLogger(__name__)

class MarketDataService:
    # Döviz/kripto sembollerini ve görünen isimlerini eşleştir
    EXTRA_SYMBOLS = {
        "DOLAR": {"yf": "TRY=X",    "label": "Dolar/TL"},
        "EURO":  {"yf": "EURTRY=X", "label": "Euro/TL"},
        "ALTIN": {"yf": "GC=F",     "label": "Gram Altın"},
        "BTC":   {"yf": "BTC-USD",  "label": "Bitcoin"},
    }

    def __init__(self):
        # Major indices for reference
        self.indices_symbols = ["XU100", "XU030"]
        # Common period mapping for OHLCV
        self.period_config = {
            "1G": {"period": "1d", "interval": "15m"},
            "1H": {"period": "7d", "interval": "1h"},
            "1A": {"period": "1mo", "interval": "1h", "resample": "4h"},
            "3A": {"period": "3mo", "interval": "1d"},
            "1Y": {"period": "1y", "interval": "1wk"}
        }

    def get_indices(self) -> List[Dict[str, Any]]:
        """
        BIST100, BIST30 canlı endeks verisi + Döviz/Kripto pariteleri.
        """
        results = []
        for sym in self.indices_symbols:
            try:
                ticker = bp.Ticker(sym)
                info = ticker.info
                # info is typically a dict from yfinance-like structure
                results.append({
                    "index_name": sym,
                    "value": info.get("regularMarketPrice", 0.0),
                    "change_percentage": info.get("regularMarketChangePercent", 0.0)
                })
            except Exception as e:
                logger.error(f"Error fetching index {sym}: {e}")
                results.append({"index_name": sym, "value": 0.0, "change_percentage": 0.0})

        # Döviz & Kripto pariteleri — yfinance üzerinden
        try:
            import yfinance as yf
            for key, meta in self.EXTRA_SYMBOLS.items():
                try:
                    yf_ticker = yf.Ticker(meta["yf"])
                    hist = yf_ticker.history(period="2d")
                    if not hist.empty:
                        price = float(hist['Close'].iloc[-1])
                        prev = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else price
                    else:
                        price = 0.0
                        prev = 0.0
                        
                    if key == "ALTIN":
                        price = price / 31.10347
                        prev = prev / 31.10347
                        
                    change_pct = ((price - prev) / prev * 100) if prev else 0.0
                    results.append({
                        "index_name": meta["label"],
                        "value": float(price),
                        "change_percentage": float(change_pct),
                    })
                except Exception as inner_e:
                    logger.error(f"Error fetching extra symbol {key}: {inner_e}")
                    results.append({"index_name": meta["label"], "value": 0.0, "change_percentage": 0.0})
        except ImportError:
            logger.warning("yfinance not installed; skipping currency/crypto indices.")

        return results


    def get_market_overview(self, stock_list: List[str] = None) -> Dict[str, Any]:
        """
        Verilen stock listesi üzerinden (varsayılan BIST30 ana kağıtları) 
        yükselenler, düşenler ve hacimlileri filtreleyip döner.
        """
        if not stock_list:
            # Örnek BIST30 ana hisseleri
            stock_list = ["THYAO", "ASELS", "TUPRS", "SASA", "HEKTS", 
                          "GARAN", "AKBNK", "YKBNK", "EREGL", "KCHOL",
                          "SISE", "BIMAS", "ISCTR", "PGSUS", "TCELL"]
        
        all_data = []
        for sym in stock_list:
            try:
                ticker = bp.Ticker(sym)
                info = ticker.info
                # info field names used as confirmed by dir() search
                price = info.get("regularMarketPrice") or info.get("last") or 0.0
                change_pct = info.get("regularMarketChangePercent") or info.get("change_percent") or 0.0
                volume = info.get("regularMarketVolume") or info.get("volume") or 0.0
                
                all_data.append({
                    "symbol": sym,
                    "price": float(price),
                    "change_percentage": float(change_pct),
                    "volume": float(volume)
                })
            except Exception as e:
                logger.error(f"Error fetching market overview for {sym}: {e}")

        # Filtreleme
        top_gainers = sorted(all_data, key=lambda x: x["change_percentage"], reverse=True)[:5]
        top_losers = sorted(all_data, key=lambda x: x["change_percentage"])[:5]
        high_volume = sorted(all_data, key=lambda x: x["volume"], reverse=True)[:5]

        return {
            "top_gainers": top_gainers,
            "top_losers": top_losers,
            "high_volume": high_volume,
            "indices": self.get_indices()
        }

    def get_all_stocks(self) -> List[Dict[str, Any]]:
        """
        Tüm BIST hisselerini döner.
        """
        try:
            from app.services.seeder import market_cache
            if market_cache.data.get("all_stocks"):
                return market_cache.data["all_stocks"]
                
            df = bp.companies()
            if df.empty:
                return []
            
            # Simple fallback classification if cache is not populated yet
            results = []
            for _, row in df.iterrows():
                ticker = row['ticker']
                name = row.get('name') or ticker
                
                # Heuristic classification
                symbol_upper = ticker.upper()
                name_upper = name.upper()
                
                banking_syms = ["AKBNK", "ALBRK", "GARAN", "HALKB", "ISCTR", "KLNMA", "QNB", "TSKB", "VAKBN", "YKBNK", "ICBCT"]
                energy_syms = ["ENJS", "ODAS", "AKSEN", "ZOREN", "AYDEM", "GWIND", "CONSE", "HUNER", "ALFAS", "YEOTK", "SMRTG", "ASTOR", "EUPWR", "CATES", "ENTRA", "BRSAN", "CWENE"]
                trans_syms = ["THYAO", "PGSUS", "TAVHL", "DOCO", "CLEBI", "RYGYO", "GSDDE"]
                retail_syms = ["BIMAS", "SOKM", "MGROS", "CRFSA", "TKNSA", "MAVI", "VAKKO", "DOAS"]
                
                if any(s in symbol_upper for s in banking_syms) or "BANK" in name_upper or "KATILIM" in name_upper:
                    sector = "Bankacılık"
                elif any(s in symbol_upper for s in energy_syms) or "ENERJ" in name_upper or "ELEKTR" in name_upper or "SOLAR" in name_upper or "RUZGAR" in name_upper:
                    sector = "Enerji"
                elif any(s in symbol_upper for s in trans_syms) or "HAVA" in name_upper or "ULASTIRMA" in name_upper or "TASIMACILIK" in name_upper or "LOJISTIK" in name_upper or "DENIZ" in name_upper:
                    sector = "Ulaştırma"
                elif any(s in symbol_upper for s in retail_syms) or "MAGAZA" in name_upper or "MARKET" in name_upper or "PERAKENDE" in name_upper or "TEKSTIL" in name_upper or "GIYIM" in name_upper:
                    sector = "Perakende"
                else:
                    sector = "Sanayi"
                    
                results.append({
                    "ticker": ticker,
                    "name": name,
                    "sector": sector,
                    "price": 0.0,
                    "change": 0.0,
                    "volume": 0.0
                })
            return results
        except Exception as e:
            logger.error(f"Error fetching all stocks: {e}")
            return []

    def search_stocks(self, query: str) -> List[Dict[str, Any]]:
        """
        Hisse arama.
        """
        try:
            df = bp.search_companies(query)
            if df.empty:
                return []
            return df.to_dict(orient="records")
        except Exception as e:
            logger.error(f"Error searching stocks for {query}: {e}")
            return []

    def get_ohlcv(self, symbol: str, period: str = "1G") -> Dict[str, Any]:
        """
        Hisse sembolüne göre OHLCV zaman serisi verisi.
        """
        try:
            config = self.period_config.get(period, self.period_config["1G"])
            ticker = bp.Ticker(symbol)
            df = ticker.history(period=config["period"], interval=config["interval"])
            
            if df.empty:
                return {"symbol": symbol, "period": period, "interval": config["interval"], "period_change_percent": 0.0, "data": []}
            
            # Resampling logic (e.g. for 4h)
            if "resample" in config:
                df = df.resample(config["resample"]).agg({
                    'Open': 'first',
                    'High': 'max',
                    'Low': 'min',
                    'Close': 'last',
                    'Volume': 'sum'
                }).dropna()

            is_precious_metal = symbol in ("GC=F", "SI=F")

            # Calculate period percentage change
            first_price = df['Open'].iloc[0]
            last_price = df['Close'].iloc[-1]
            if is_precious_metal:
                first_price /= 31.10347
                last_price /= 31.10347
            period_change = ((last_price - first_price) / first_price * 100) if first_price != 0 else 0.0

            df = df.reset_index()
            results = []
            for _, row in df.iterrows():
                date_val = row.get('Date') or row.get('index')
                date_str = date_val.isoformat() if hasattr(date_val, 'isoformat') else str(date_val)
                
                open_p = float(row.get('Open', row.get('open', 0.0)))
                high_p = float(row.get('High', row.get('high', 0.0)))
                low_p = float(row.get('Low', row.get('low', 0.0)))
                close_p = float(row.get('Close', row.get('close', 0.0)))
                
                if is_precious_metal:
                    open_p /= 31.10347
                    high_p /= 31.10347
                    low_p /= 31.10347
                    close_p /= 31.10347

                results.append({
                    "date": date_str,
                    "open": open_p,
                    "high": high_p,
                    "low": low_p,
                    "close": close_p,
                    "volume": float(row.get('Volume', row.get('volume', 0.0)))
                })
            
            return {
                "symbol": symbol,
                "period": period,
                "interval": config.get("resample") or config["interval"],
                "period_change_percent": round(period_change, 2),
                "data": results
            }
        except Exception as e:
            logger.error(f"Error fetching OHLCV for {symbol}: {e}")
            return {"symbol": symbol, "period": period, "interval": "N/A", "period_change_percent": 0.0, "data": []}

    def get_news(self, symbol: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Şirket bazlı KAP haberlerini döner.
        """
        try:
            ticker = bp.Ticker(symbol)
            df = ticker.news
            if df.empty:
                return []
            
            # Limited to last N news
            df = df.head(limit)
            
            # Map capitalized keys (Date, Title, URL) to lowercase (date, title, url)
            results = []
            for _, row in df.iterrows():
                results.append({
                    "date": str(row.get("Date", "")),
                    "title": str(row.get("Title", "")),
                    "url": str(row.get("URL", ""))
                })
            return results
        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {e}")
            return []

    def get_news_content(self, disclosure_id: str) -> Optional[str]:
        """
        KAP bildirim içeriğini HTML olarak döner.
        """
        try:
            # We can use a dummy ticker or if Ticker requires symbol:
            ticker = bp.Ticker("THYAO") 
            return ticker.get_news_content(disclosure_id)
        except Exception as e:
            logger.error(f"Error fetching news content for {disclosure_id}: {e}")
            return None

    def get_economic_calendar(self, period: str = "1w") -> List[Dict[str, Any]]:
        """
        Ekonomi takvimini döner (TR ve US ağırlıklı).
        """
        try:
            cal = bp.EconomicCalendar()
            df = cal.events(period=period, country=["TR", "US"])
            if df.empty:
                return []
            
            # Format dataframe results to dict
            results = []
            for _, row in df.iterrows():
                results.append({
                    "date": str(row.get("Date")),
                    "time": str(row.get("Time")),
                    "country": str(row.get("Country")),
                    "importance": str(row.get("Importance")),
                    "event": str(row.get("Event")),
                    "actual": str(row.get("Actual")) if pd.notna(row.get("Actual")) else None,
                    "forecast": str(row.get("Forecast")) if pd.notna(row.get("Forecast")) else None,
                    "previous": str(row.get("Previous")) if pd.notna(row.get("Previous")) else None,
                })
            return results
        except Exception as e:
            logger.error(f"Error fetching economic calendar: {e}")
            return []

    def get_company_profile(self, symbol: str) -> Dict[str, Any]:
        """
        Şirket profili ve çok daha kapsamlı rasyolar (tüm ticker.info verileri).
        """
        try:
            ticker = bp.Ticker(symbol)
            info = ticker.info
            
            is_precious_metal = symbol in ("GC=F", "SI=F")
            divisor = 31.10347 if is_precious_metal else 1.0

            # Detailed metrics from info
            price_val = (info.get("regularMarketPrice") or info.get("last") or 0.0) / divisor
            change_pct = info.get("regularMarketChangePercent") or info.get("change_percent") or 0.0
            change_amt = (info.get("regularMarketChange") or (price_val * change_pct / 100) or 0.0)
            if not info.get("regularMarketChange") and not is_precious_metal:
                change_amt = (price_val * change_pct / 100)
            elif is_precious_metal:
                change_amt = change_amt / divisor

            fifty_two_week_high = info.get("fiftyTwoWeekHigh")
            if fifty_two_week_high is not None:
                fifty_two_week_high /= divisor

            fifty_two_week_low = info.get("fiftyTwoWeekLow")
            if fifty_two_week_low is not None:
                fifty_two_week_low /= divisor

            fifty_day_average = info.get("fiftyDayAverage")
            if fifty_day_average is not None:
                fifty_day_average /= divisor

            two_hundred_day_average = info.get("twoHundredDayAverage")
            if two_hundred_day_average is not None:
                two_hundred_day_average /= divisor

            open_price = info.get("regularMarketOpen") or info.get("open")
            if open_price is not None:
                open_price /= divisor

            day_high = info.get("regularMarketDayHigh") or info.get("dayHigh")
            if day_high is not None:
                day_high /= divisor

            day_low = info.get("regularMarketDayLow") or info.get("dayLow")
            if day_low is not None:
                day_low /= divisor

            prev_close = info.get("regularMarketPreviousClose") or info.get("previousClose")
            if prev_close is not None:
                prev_close /= divisor

            metrics = {
                "symbol": symbol,
                "price": price_val,
                "change_percent": change_pct,
                "change_amount": change_amt,
                "market_cap": info.get("marketCap"),
                "pe_ratio": info.get("trailingPE") or info.get("forwardPE"),
                "pb_ratio": info.get("priceToBook"),
                "eps": info.get("trailingEps"),
                "enterprise_to_ebitda": info.get("enterpriseToEbitda"),
                "net_debt": info.get("netDebt"),
                "float_shares": info.get("floatShares"),
                "foreign_ratio": info.get("foreignRatio"),
                "dividend_yield": info.get("dividendYield"),
                "fifty_two_week_high": fifty_two_week_high,
                "fifty_two_week_low": fifty_two_week_low,
                "fifty_day_average": fifty_day_average,
                "two_hundred_day_average": two_hundred_day_average,
                "beta": info.get("beta"),
                # Daily OHLC
                "volume": info.get("regularMarketVolume") or info.get("volume"),
                "open_price": open_price,
                "day_high": day_high,
                "day_low": day_low,
                "prev_close": prev_close,
            }
            # Tavan / Taban hesapla (±%10 BIST günlük fiyat limiti)
            prev = metrics.get("prev_close") or metrics.get("price") or 0
            if prev:
                metrics["upper_limit"] = round(prev * 1.10, 2)
                metrics["lower_limit"] = round(prev * 0.90, 2)
            
            # Logo URL — borsapy/yfinance'den veya clearbit üzerinden
            logo_url = (
                info.get("logo_url") or
                info.get("logoUrl") or
                None
            )
            # Clearbit fallback (domain üzerinden)
            website = info.get("website") or ""
            if not logo_url and website:
                from urllib.parse import urlparse
                domain = urlparse(website).netloc.replace("www.", "")
                if domain:
                    logo_url = f"https://logo.clearbit.com/{domain}"

            profile = {
                "symbol": symbol,
                "name": info.get("longName") or info.get("name"),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "website": website,
                "description": info.get("longBusinessSummary"),
                "logo_url": logo_url,
                "metrics": metrics,
                "dividends": self.get_dividends(symbol)
            }
            return profile
        except Exception as e:
            logger.error(f"Error fetching company profile for {symbol}: {e}")
            # Fallback if specific symbol info fails
            return {"symbol": symbol, "dividends": []}

    def get_dividends(self, symbol: str) -> List[Dict[str, Any]]:
        """
        Şirket temettü geçmişini döner.
        """
        try:
            ticker = bp.Ticker(symbol)
            divs = ticker.dividends
            
            if divs is None or (isinstance(divs, pd.Series) and divs.empty):
                return []
            
            results = []
            if isinstance(divs, pd.Series):
                divs = divs.reset_index()
                for _, row in divs.iterrows():
                    date_val = row.get('Date') or row.get('index')
                    date_str = date_val.isoformat() if hasattr(date_val, 'isoformat') else str(date_val)
                    results.append({
                        "date": date_str,
                        "dividend": float(row[0] if 0 in row else row.get('Dividends', 0.0))
                    })
            return results
        except Exception as e:
            logger.error(f"Error fetching dividends for {symbol}: {e}")
            return []

market_service = MarketDataService()
