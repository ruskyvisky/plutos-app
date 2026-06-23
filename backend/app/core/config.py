from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Borsa API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # APScheduler
    SEEDER_INTERVAL_MINUTES: int = 5

    # JWT Auth
    SECRET_KEY: str = "plutos-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 hafta

    # Database
    DATABASE_URL: str = "sqlite:///./plutos.db"

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
