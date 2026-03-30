# Fast2SMS service for OTP delivery
import aiohttp
import random
import logging
import secrets
from app.core.config import FAST2SMS_API_KEY, FAST2SMS_SENDER_ID, FAST2SMS_MESSAGE_ID

logger = logging.getLogger(__name__)

FAST2SMS_BASE_URL = "https://www.fast2sms.com/dev/bulkV2"

class Fast2SMSService:
    def __init__(self):
        self.api_key = FAST2SMS_API_KEY
        self.base_url = FAST2SMS_BASE_URL
        self.sender_id = FAST2SMS_SENDER_ID
        self.message_id = FAST2SMS_MESSAGE_ID

    def generate_otp(self) -> str:
        """Generate cryptographically secure 6-digit OTP."""
        return str(secrets.randbelow(900000) + 100000)
    
    async def send_otp(self, phone_number: str) -> dict:
        """Send OTP to phone number using Fast2SMS"""
        otp = self.generate_otp()
        
        params = {
            "authorization": self.api_key,
            "route": "dlt",
            "sender_id": self.sender_id,
            "message": self.message_id,
            "variables_values": otp,
            "flash": "0",
            "numbers": phone_number
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, params=params) as response:
                    if response.status == 200:
                        result = await response.json(content_type=None)
                        
                        if result.get("return") == True:
                            logger.info(f"OTP sent successfully to {phone_number}")
                            return {
                                "success": True,
                                "otp": otp,
                                "message": "OTP sent successfully",
                                "request_id": result.get("request_id")
                            }
                        else:
                            logger.warning(f"Fast2SMS failed: {result}. Using dev fallback OTP.")
                            # DEV FALLBACK: log OTP when SMS gateway fails
                            logger.info(f"[DEV OTP] Phone: {phone_number}, OTP: {otp}")
                            return {
                                "success": True,
                                "otp": otp,
                                "message": "OTP generated (dev mode)",
                                "request_id": "dev_fallback"
                            }
                    else:
                        logger.warning(f"Fast2SMS API returned {response.status}. Using dev fallback OTP.")
                        logger.info(f"[DEV OTP] Phone: {phone_number}, OTP: {otp}")
                        return {
                            "success": True,
                            "otp": otp,
                            "message": "OTP generated (dev mode)",
                            "request_id": "dev_fallback"
                        }
        except Exception as e:
            logger.warning(f"SMS service error: {e}. Using dev fallback OTP.")
            logger.info(f"[DEV OTP] Phone: {phone_number}, OTP: {otp}")
            return {
                "success": True,
                "otp": otp,
                "message": "OTP generated (dev mode)",
                "request_id": "dev_fallback"
            }
    
    async def verify_otp(self, stored_otp: str, entered_otp: str) -> bool:
        """Verify OTP"""
        return stored_otp == entered_otp

sms_service = Fast2SMSService()