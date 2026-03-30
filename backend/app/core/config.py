"""
config.py — Single source of truth for all application-wide constants.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env relative to the project root (backend/.env)
ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

# ── Database ──────────────────────────────────────────────────────────────────
MONGO_URL: str = os.environ.get("MONGO_URL", "")
DB_NAME: str = os.environ.get("DB_NAME", "servedoor")

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET: str = os.environ.get("JWT_SECRET", "change_me_in_production")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRY_DAYS: int = 7

# ── OTP ───────────────────────────────────────────────────────────────────────
OTP_EXPIRY_MINUTES: int = 10
OTP_MAX_ATTEMPTS: int = 3

# ── Cart / Pricing ────────────────────────────────────────────────────────────
DELIVERY_FEE: float = 30.0
FREE_DELIVERY_ABOVE: float = 300.0
TAX_RATE: float = 0.05          # 5% GST
MIN_ORDER_VALUE: float = 100.0

# ── Pagination ────────────────────────────────────────────────────────────────
DEFAULT_PAGE_SIZE: int = 20
MAX_PAGE_SIZE: int = 100

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ORIGINS: list[str] = os.environ.get("CORS_ORIGINS", "*").split(",")

# ── External Services ─────────────────────────────────────────────────────────
FAST2SMS_API_KEY: str = os.environ.get("FAST2SMS_API_KEY", "")
GEOAPIFY_API_KEY: str = os.environ.get("GEOAPIFY_API_KEY", "")
FAST2SMS_SENDER_ID: str = "SRVDOR"
FAST2SMS_MESSAGE_ID: str = "197282"

# ── SMTP / Emailing ───────────────────────────────────────────────────────────
SMTP_HOST: str = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT: int = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER: str = os.environ.get("SMTP_USER", "")
SMTP_PASS: str = os.environ.get("SMTP_PASS", "")
FROM_EMAIL: str = os.environ.get("FROM_EMAIL", "support@servedoor.com")

# ── Validation ────────────────────────────────────────────────────────────────
def validate_config() -> list[str]:
    """Return a list of missing critical config keys."""
    missing = []
    if not MONGO_URL:
        missing.append("MONGO_URL")
    if JWT_SECRET == "change_me_in_production":
        missing.append("JWT_SECRET (using insecure default)")
    if not CORS_ORIGINS:
        missing.append("CORS_ORIGINS")

    env = os.environ.get("ENV", "development").lower()
    if env in {"production", "prod"} and "*" in CORS_ORIGINS:
        missing.append("CORS_ORIGINS must not include * in production")

    if env in {"production", "prod"} and missing:
        raise ValueError(f"Invalid configuration: {', '.join(missing)}")

    return missing
