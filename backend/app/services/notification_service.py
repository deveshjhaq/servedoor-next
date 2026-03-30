"""
notification_service.py — Handles generic emailing and invoice delivery.
"""
import logging
import smtplib
from email.message import EmailMessage
import asyncio
from typing import Optional

from app.core.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
from app.services.invoice_service import generate_invoice_pdf

logger = logging.getLogger(__name__)

class NotificationService:
    
    def _send_email_sync(self, to_email: str, subject: str, body: str, attachment_bytes: Optional[bytes] = None, attachment_name: str = "document.pdf") -> bool:
        """Synchronous internal method for sending SMTP emails."""
        if not SMTP_USER or not SMTP_PASS:
            logger.warning("SMTP credentials not configured. Skipping email to %s", to_email)
            return False
            
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg.set_content(body)
        
        if attachment_bytes:
            msg.add_attachment(
                attachment_bytes, 
                maintype='application', 
                subtype='pdf', 
                filename=attachment_name
            )
            
        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
            logger.info("Successfully sent email to %s", to_email)
            return True
        except Exception as e:
            logger.error("Failed to send email to %s: %s", to_email, str(e))
            return False

    async def send_invoice_email(self, order_dict: dict, user_dict: dict) -> bool:
        """
        Generate PDF invoice and email it to the customer asynchronously.
        order_dict AND user_dict must be dictionary representations of the models.
        """
        user_email = user_dict.get('email')
        if not user_email:
            logger.warning("Cannot send invoice: User has no email address.")
            return False
            
        order_id = order_dict.get("orderId", "UNKNOWN")
        
        # Run CPU bound PDF generation in a separate thread
        pdf_bytes = await asyncio.to_thread(generate_invoice_pdf, order_dict, user_dict)
        
        subject = f"Your serveDoor Invoice [Order #{order_id}]"
        body = f"Hi {user_dict.get('name', 'Customer')},\n\nThank you for ordering with serveDoor! Please find your invoice attached for Order #{order_id}.\n\nWarm regards,\nThe serveDoor Team"
        
        # Run IO bound SMTP operation in a separate thread to unblock FastAPI
        success = await asyncio.to_thread(
            self._send_email_sync,
            to_email=user_email,
            subject=subject,
            body=body,
            attachment_bytes=pdf_bytes,
            attachment_name=f"Invoice_{order_id}.pdf"
        )
        return success

notification_service = NotificationService()
