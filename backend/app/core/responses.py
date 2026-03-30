"""
core/responses.py — Standardized JSON response helpers.

Every route should return via these helpers so the frontend always
receives a consistent envelope: { success, message, data, errors }.
"""
from typing import Any, Optional
from fastapi.responses import JSONResponse


def ok(data: Any = None, message: str = "Success", status_code: int = 200) -> dict:
    """Standard 2xx response."""
    return {"success": True, "message": message, "data": data}


def created(data: Any = None, message: str = "Created successfully") -> JSONResponse:
    """201 Created response."""
    return JSONResponse(
        status_code=201,
        content={"success": True, "message": message, "data": data},
    )


def paginated(
    items: list,
    total: int,
    page: int,
    limit: int,
    message: str = "Success",
) -> dict:
    """Paginated list response."""
    return {
        "success": True,
        "message": message,
        "data": items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    }


def error(message: str, errors: Optional[Any] = None, status_code: int = 400) -> JSONResponse:
    """Error response (prefer raising HTTPException for automatic handling)."""
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "message": message, "errors": errors},
    )
