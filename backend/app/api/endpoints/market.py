from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas.market import StockData, OHLCVData, CompanyProfile, CompanyShort, OHLCVResponse
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
