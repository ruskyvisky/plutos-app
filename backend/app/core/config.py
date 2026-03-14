from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Borsa API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # APScheduler
    SEEDER_INTERVAL_MINUTES: int = 5

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
