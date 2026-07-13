from fastapi import APIRouter

from common import site_config
from services import payments_status

router = APIRouter(prefix="/api")


@router.get("/")
async def root():
    return {"ok": True, "service": "cultivate"}


@router.get("/config")
async def get_config():
    return site_config()


@router.get("/payments/status")
async def payments():
    return payments_status()
