from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.settings import SystemSettings

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsUpdateRequest(BaseModel):
    llm_provider: Optional[str] = "gpt-4o-mini"
    temperature: Optional[float] = 0.1
    slack_webhook_url: Optional[str] = None
    pagerduty_token: Optional[str] = None
    slo_p95_latency_ms: Optional[float] = 500.0
    slo_error_rate_pct: Optional[float] = 2.0
    auto_investigate: Optional[bool] = True

@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(SystemSettings).where(SystemSettings.id == "default-settings"))
    s = res.scalars().first()
    if not s:
        s = SystemSettings(id="default-settings")
        db.add(s)
        await db.commit()
    return s

@router.post("")
async def update_settings(req: SettingsUpdateRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(SystemSettings).where(SystemSettings.id == "default-settings"))
    s = res.scalars().first()
    if not s:
        s = SystemSettings(id="default-settings")
        db.add(s)

    if req.llm_provider is not None: s.llm_provider = req.llm_provider
    if req.temperature is not None: s.temperature = req.temperature
    if req.slack_webhook_url is not None: s.slack_webhook_url = req.slack_webhook_url
    if req.pagerduty_token is not None: s.pagerduty_token = req.pagerduty_token
    if req.slo_p95_latency_ms is not None: s.slo_p95_latency_ms = req.slo_p95_latency_ms
    if req.slo_error_rate_pct is not None: s.slo_error_rate_pct = req.slo_error_rate_pct
    if req.auto_investigate is not None: s.auto_investigate = req.auto_investigate
    
    s.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return s
