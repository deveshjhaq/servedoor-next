"""
main.py — The FastAPI application entrypoint.
Orchestrates connections, middlewares, exceptions, and binds modular routes.
"""
import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS, validate_config
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.middleware import SecurityHeadersMiddleware
from app.core.rate_limit import limiter

from app.routes import (
    auth, cart, orders, restaurants,
    users, admin, payments, notifications
)

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ── Middlewares ──
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = req_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response

# ── Lifespan Startup/Shutdown Hook ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Log missing configs
    missing = validate_config()
    if missing:
        logger.warning("⚠️  Missing config keys: %s", ", ".join(missing))

    # Initialize Repositories (indexes etc)
    await connect_to_mongo()
    logger.info("🚀 serveDoor Architecture Ready!")
    
    yield
    
    await close_mongo_connection()

# ── App Definition ──
app = FastAPI(
    title="serveDoor Clean Architecture API",
    description="Refactored modular domain-driven API",
    version="3.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Add Middlewares ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# ── Exception Handlers ──
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(p) for p in e["loc"]), "msg": e["msg"]} for e in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation error", "errors": errors},
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "unknown")
    if hasattr(exc, "status_code"): # Fallback for HTTPExceptions if not caught natively
        return JSONResponse(
            status_code=exc.status_code, 
            content={"success": False, "message": exc.detail}
        )
    logger.exception("Unhandled error [%s]", req_id)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An unexpected error occurred.", "request_id": req_id},
    )

# ── Mount Routers ──
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(restaurants.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/api/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "architecture": "clean"}
