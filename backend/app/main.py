import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Base, engine
from app.api.router import api_router
from app.services.seeder import start_scheduler

# Modellerin metadata'ya kayıt olması için import et
import app.models  # noqa: F401

# Loglama seviyesini ayarla
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: DB tablolarını oluştur ve Scheduler'ı başlat
    logger.info("Uygulama başlatılıyor...")
    Base.metadata.create_all(bind=engine)
    logger.info("Veritabanı tabloları hazır.")
    start_scheduler()
    yield
    # Shutdown: Kaynakları temizle (isteğe bağlı)
    logger.info("Uygulama kapatılıyor...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS — Expo Go, web tarayıcı ve yerel ağ cihazları için
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için açık; prodda kısıtlayın
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
