from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging

from app.schemas.market import PortfolioData, Holding, GeneralNewsItem
from app.services.seeder import market_cache
from app.services.market_data import market_service

router = APIRouter()
logger = logging.getLogger(__name__)

# ─── In-memory sanal portföy ──────────────────────────────────
# Gerçek bir kullanıcı sistemi için veritabanına taşıyın.
_portfolio: Dict[str, Any] = {
    "cash": 100_000.0,  # 100K TL başlangıç bakiyesi
    "holdings": {}       # { symbol: { name, quantity, avg_cost } }
}


def _get_current_price(symbol: str) -> float:
    """market_cache veya borsapy'den anlık fiyat getirir."""
    # Önce cache'e bak (top_gainers/losers/high_volume içinde olabilir)
    for key in ("top_gainers", "top_losers", "high_volume"):
        for item in market_cache.data.get(key, []):
            if item.get("symbol") == symbol:
                return float(item.get("price", 0.0))
    # Cache'de yoksa direkt çek
    try:
        profile = market_service.get_company_profile(symbol)
        m = profile.get("metrics") or {}
        return float(m.get("price") or 0.0)
    except Exception:
        return 0.0


def _build_portfolio_response() -> PortfolioData:
    holdings_out: List[Holding] = []
    total_invested = 0.0
    total_current = 0.0

    for symbol, h in _portfolio["holdings"].items():
        cp = _get_current_price(symbol)
        invested = h["quantity"] * h["avg_cost"]
        current = h["quantity"] * cp
        total_invested += invested
        total_current += current
        holdings_out.append(Holding(
            symbol=symbol,
            name=h.get("name", symbol),
            quantity=h["quantity"],
            avg_cost=h["avg_cost"],
            current_price=cp,
        ))

    cash = _portfolio["cash"]
    total_balance = cash + total_current
    total_pl = total_current - total_invested
    total_pl_percent = (total_pl / total_invested * 100) if total_invested > 0 else 0.0

    return PortfolioData(
        total_balance=round(total_balance, 2),
        cash=round(cash, 2),
        total_invested=round(total_invested, 2),
        total_pl=round(total_pl, 2),
        total_pl_percent=round(total_pl_percent, 2),
        daily_pl=0.0,        # Günlük P&L için tarihsel snapshot gerekir
        daily_pl_percent=0.0,
        holdings=holdings_out,
    )


@router.get("/", response_model=PortfolioData)
async def get_portfolio():
    """Sanal portföyü döner."""
    return _build_portfolio_response()


@router.post("/trade")
async def execute_trade(symbol: str, quantity: int, trade_type: str):
    """
    Al / Sat işlemi yapar.
    trade_type: 'buy' | 'sell'
    """
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Geçersiz adet.")
    if trade_type not in ("buy", "sell"):
        raise HTTPException(status_code=400, detail="trade_type 'buy' veya 'sell' olmalı.")

    price = _get_current_price(symbol)
    if price == 0:
        raise HTTPException(status_code=404, detail=f"{symbol} için fiyat bulunamadı.")

    total_cost = price * quantity

    if trade_type == "buy":
        if _portfolio["cash"] < total_cost:
            raise HTTPException(status_code=400, detail="Yetersiz nakit bakiye.")

        _portfolio["cash"] -= total_cost
        if symbol in _portfolio["holdings"]:
            h = _portfolio["holdings"][symbol]
            new_qty = h["quantity"] + quantity
            h["avg_cost"] = (h["avg_cost"] * h["quantity"] + total_cost) / new_qty
            h["quantity"] = new_qty
        else:
            # Şirket adını profile'dan al
            try:
                profile = market_service.get_company_profile(symbol)
                name = profile.get("name") or symbol
            except Exception:
                name = symbol
            _portfolio["holdings"][symbol] = {
                "name": name,
                "quantity": quantity,
                "avg_cost": price,
            }
        return {"success": True, "message": f"{quantity} adet {symbol} başarıyla alındı. (₺{total_cost:,.2f})"}

    else:  # sell
        if symbol not in _portfolio["holdings"]:
            raise HTTPException(status_code=400, detail=f"Portföyünüzde {symbol} bulunmuyor.")
        h = _portfolio["holdings"][symbol]
        if h["quantity"] < quantity:
            raise HTTPException(status_code=400, detail=f"Yeterli hisse yok. ({h['quantity']} adet mevcut)")

        _portfolio["cash"] += total_cost
        h["quantity"] -= quantity
        if h["quantity"] == 0:
            del _portfolio["holdings"][symbol]
        return {"success": True, "message": f"{quantity} adet {symbol} başarıyla satıldı. (₺{total_cost:,.2f})"}


@router.get("/news/general", response_model=List[GeneralNewsItem])
async def get_general_news(limit: int = 30):
    """
    Portföydeki + popüler hisselerden KAP haberlerini birleştirir.
    """
    # Hisse listesi: portföydekiler + BIST30 popüler hisseler
    symbols = list(_portfolio["holdings"].keys())
    popular = ["THYAO", "GARAN", "AKBNK", "ASELS", "EREGL",
               "TUPRS", "KCHOL", "BIMAS", "PGSUS", "SISE"]
    all_symbols = list(dict.fromkeys(symbols + popular))[:10]  # max 10 sembol

    news_items: List[GeneralNewsItem] = []
    seen_titles: set = set()

    for sym in all_symbols:
        try:
            raw = market_service.get_news(sym, limit=5)
            for i, n in enumerate(raw):
                title = n.get("title", "")
                if title in seen_titles:
                    continue
                seen_titles.add(title)
                news_items.append(GeneralNewsItem(
                    id=f"{sym}_{i}",
                    title=title,
                    summary=title,
                    source="KAP",
                    date=n.get("date", ""),
                    symbol=sym,
                    url=n.get("url", ""),
                    category="kap",
                ))
        except Exception as e:
            logger.warning(f"Haber çekilemedi ({sym}): {e}")

    # Tarihe göre sırala (en yeni başta)
    news_items.sort(key=lambda x: x.date, reverse=True)
    return news_items[:limit]
