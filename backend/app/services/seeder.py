import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from typing import Dict, Any

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
    }
    indices: Dict[str, Any] = {}

market_cache = MarketDataCache()

def fetch_and_cache_market_data():
    """
    Borsapy'den verileri çekip in-memory cache'i güncelleyen fonksiyon.
    """
    try:
        logger.info("Market verisi çekiliyor...")
        overview = market_service.get_market_overview()
        
        # Cache'i güncelle
        market_cache.data["top_gainers"] = overview.get("top_gainers", [])
        market_cache.data["top_losers"] = overview.get("top_losers", [])
        market_cache.data["high_volume"] = overview.get("high_volume", [])
        
        # Endeksleri güncelle
        indices_data = overview.get("indices", [])
        for idx in indices_data:
            market_cache.indices[idx["index_name"]] = idx
            
        logger.info("Market veri cache'i güncellendi.")
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
