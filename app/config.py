from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    anthropic_api_key: str
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str = "eu-west-1"
    dynamo_recipes_table: str = "easyeats-recipes"
    dynamo_prefs_table: str = "easyeats-preferences"
    api_secret_key: str = "dev-secret"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()