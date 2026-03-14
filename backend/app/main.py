import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.router import api_router
from app.services.seeder import start_scheduler

# Loglama seviyesini ayarla
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Scheduler'ı başlat
    logger.info("Uygulama başlatılıyor...")
    start_scheduler()
    yield
    # Shutdown: Kaynakları temizle (isteğe bağlı)
    logger.info("Uygulama kapatılıyor...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# API Router'ı dahil et
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
