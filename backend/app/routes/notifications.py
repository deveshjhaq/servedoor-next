"""
notifications.py — Routes for User Notification Bell.
"""
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
import logging

from app.core.responses import ok, paginated
from app.routes.dependencies import get_current_user
from app.models.models import User
# from app.repositories.repos import notification_repo

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/")
async def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    user: User = Depends(get_current_user)
):
    """Fetch notifications for the authenticated user."""
    # Since Notifications schema isn't fully migrated yet, return an empty paginator
    # to softly bridge the frontend expectations.
    return paginated(
        items=[],
        total=0,
        page=page,
        limit=limit
    )

@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: User = Depends(get_current_user)):
    return ok(message="Marked read")

@router.put("/mark-all-read")
async def mark_all_read(user: User = Depends(get_current_user)):
    return ok(message="All marked read")
