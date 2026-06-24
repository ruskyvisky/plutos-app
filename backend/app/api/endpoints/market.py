from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas.market import (
    StockData, OHLCVData, CompanyProfile, CompanyShort, 
    OHLCVResponse, NewsData, CalendarEvent
)
from app.services.seeder import market_cache
from app.services.market_data import market_service

router = APIRouter()

@router.get("/all", response_model=List[CompanyShort])
async def get_all_stocks():
    """
    Tüm kayıtlı BIST hisselerinin listesini döner.
    """
    return market_service.get_all_stocks()

@router.get("/search", response_model=List[CompanyShort])
async def search_stocks(q: str = Query(..., min_length=1, description="Arama sorgusu (isim veya sembol)")):
    """
    İsim veya sembol ile hisse arama.
    """
    return market_service.search_stocks(q)

@router.get("/top-gainers", response_model=List[StockData])
async def get_top_gainers():
    """
    Günün en çok yükselen hisselerini cache'ten döner.
    """
    return market_cache.data.get("top_gainers", [])

@router.get("/top-losers", response_model=List[StockData])
async def get_top_losers():
    """
    Günün en çok düşen hisselerini cache'ten döner.
    """
    return market_cache.data.get("top_losers", [])

@router.get("/high-volume", response_model=List[StockData])
async def get_high_volume():
    """
    Günün işlem hacmi en yüksek hisselerini cache'ten döner.
    """
    return market_cache.data.get("high_volume", [])

@router.get("/ohlcv/{symbol}", response_model=OHLCVResponse)
async def get_ohlcv(
    symbol: str, 
    period: str = Query("1G", description="Desteklenen periyotlar: 1G, 1H, 1A, 3A, 1Y")
):
    """
    Hisse Sembolüne göre OHLCV zaman serisi verisi ve periyot bazlı değişim oranı.
    """
    return market_service.get_ohlcv(symbol, period)

@router.get("/profile/{symbol}", response_model=CompanyProfile)
async def get_company_profile(symbol: str):
    """
    Şirket profili, tüm detaylı metrikler ve temettü geçmişi verilerini döner.
    """
    return market_service.get_company_profile(symbol)

@router.get("/news/{symbol}", response_model=List[NewsData])
async def get_news(symbol: str, limit: int = Query(10, ge=1, le=100)):
    """
    Belirli bir hisseye ait güncel KAP haberlerini döner.
    """
    return market_service.get_news(symbol, limit)

@router.get("/news/content/{disclosure_id}")
async def get_news_content(disclosure_id: str):
    """
    KAP bildiriminin detaylı HTML içeriğini döner.
    """
    content = market_service.get_news_content(disclosure_id)
    return {"content": content}

@router.get("/economic-calendar", response_model=List[CalendarEvent])
async def get_economic_calendar(period: str = Query("1w", description="1d, 1w, 2w, 1mo")):
    """
    Türkiye ve ABD başta olmak üzere önemli ekonomik gelişmeleri ve takvimi döner.
    """
    return market_service.get_economic_calendar(period)

@router.get("/crypto")
async def get_crypto_list():
    """
    Kripto paraları cache'ten döner.
    """
    return market_cache.data.get("crypto", [])

@router.get("/commodities")
async def get_commodities_list():
    """
    Emtiaları cache'ten döner.
    """
    return market_cache.data.get("commodities", [])
