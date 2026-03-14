from fastapi import APIRouter
from typing import List
from app.schemas.market import IndexData
from app.services.seeder import market_cache

router = APIRouter()

@router.get("/", response_model=List[IndexData])
async def get_indices():
    """
    BIST100, BIST30 canlı endeks verilerini cache'ten döner.
    """
    return list(market_cache.indices.values())

@router.get("/{index_symbol}", response_model=IndexData)
async def get_index_by_symbol(index_symbol: str):
    """
    Belirli bir endeksin (örn: BIST100) verisini döner.
    """
    # Simple check for symbol
    symbol = index_symbol.upper()
    return market_cache.indices.get(symbol, {"index_name": symbol, "value": 0.0, "change_percentage": 0.0})
