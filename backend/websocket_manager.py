"""
WebSocket Connection Manager for real-time order status updates
"""
from fastapi import WebSocket
from typing import Dict, List
import logging
import json

logger = logging.getLogger(__name__)


class WebSocketManager:
    def __init__(self):
        # user_id -> list of websocket connections (multiple tabs)
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # admin connections
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WS: User {user_id} connected. Total users: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id] = [
                ws for ws in self.active_connections[user_id] if ws != websocket
            ]
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WS: User {user_id} disconnected")

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admin_connections.append(websocket)
        logger.info(f"WS: Admin connected. Total admins: {len(self.admin_connections)}")

    def disconnect_admin(self, websocket: WebSocket):
        self.admin_connections = [ws for ws in self.admin_connections if ws != websocket]

    async def send_to_user(self, user_id: str, data: dict):
        """Send message to all connections of a specific user"""
        if user_id in self.active_connections:
            dead = []
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_json(data)
                except Exception:
                    dead.append(ws)
            # Clean up dead connections
            for ws in dead:
                self.active_connections[user_id] = [
                    w for w in self.active_connections[user_id] if w != ws
                ]

    async def broadcast_to_admins(self, data: dict):
        """Broadcast message to all admin connections"""
        dead = []
        for ws in self.admin_connections:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.admin_connections = [w for w in self.admin_connections if w != ws]

    async def notify_order_update(self, user_id: str, order_id: str, status: str, message: str = None):
        """Notify user and admins about order status change"""
        payload = {
            "type": "order_update",
            "orderId": order_id,
            "status": status,
            "message": message or f"Order status updated to {status}",
        }
        await self.send_to_user(user_id, payload)
        await self.broadcast_to_admins({**payload, "userId": user_id})

    async def notify_new_order(self, order_data: dict):
        """Notify admins about a new order"""
        await self.broadcast_to_admins({
            "type": "new_order",
            "order": {
                "orderId": order_data.get("orderId"),
                "restaurantName": order_data.get("restaurantName"),
                "total": order_data.get("total"),
                "paymentMethod": order_data.get("paymentMethod"),
            }
        })


# Global manager instance
ws_manager = WebSocketManager()
