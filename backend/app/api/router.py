from fastapi import APIRouter
from app.api.endpoints import market, indices

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(indices.router, prefix="/indices", tags=["indices"])
