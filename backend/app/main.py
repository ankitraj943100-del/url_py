import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.seed import seed_database
from app.api.dashboard import router as dashboard_router
from app.api.incidents import router as incidents_router
from app.api.services import router as services_router
from app.api.telemetry import router as telemetry_router
from app.api.agents import router as agents_router
from app.api.remediations import router as remediations_router
from app.api.simulator import router as simulator_router
from app.api.replay import router as replay_router
from app.api.postmortems import router as postmortems_router
from app.api.copilot import router as copilot_router
from app.api.knowledge import router as knowledge_router
from app.api.websockets import router as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed Database & initialize state
    try:
        await seed_database()
    except Exception as e:
        print(f"Startup DB seed warning: {e}")
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(incidents_router, prefix=settings.API_V1_STR)
app.include_router(services_router, prefix=settings.API_V1_STR)
app.include_router(telemetry_router, prefix=settings.API_V1_STR)
app.include_router(agents_router, prefix=settings.API_V1_STR)
app.include_router(remediations_router, prefix=settings.API_V1_STR)
app.include_router(simulator_router, prefix=settings.API_V1_STR)
app.include_router(replay_router, prefix=settings.API_V1_STR)
app.include_router(postmortems_router, prefix=settings.API_V1_STR)
app.include_router(copilot_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "SentinelOps AI Engine", "version": "1.0.0"}
