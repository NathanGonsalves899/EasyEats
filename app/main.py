from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import scan, recipes, preferences
from app.models.schemas import HealthResponse
from app.services.dynamo import check_dynamo_health
from app.routers import scan, recipes, preferences, auth

settings = get_settings()

app = FastAPI(
    title="EasyEats API",
    description="Zero-waste recipe generation powered by computer vision and Claude.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(scan.router)
app.include_router(recipes.router)
app.include_router(preferences.router)
app.include_router(auth.router)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {
        "status": "ok",
        "app": "EasyEats API",
        "dynamo": check_dynamo_health(),
        "anthropic": "configured" if settings.anthropic_api_key else "missing",
    }


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
async def root():
    return {"message": "EasyEats API is running. Visit /docs for the API reference."}