import aiohttp
from typing import Optional, List
from app.models.models import Coordinates, LocationResponse
import logging
from app.core.config import GEOAPIFY_API_KEY

logger = logging.getLogger(__name__)

GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1"

class LocationService:
    def __init__(self):
        self.api_key = GEOAPIFY_API_KEY
        self.base_url = GEOAPIFY_BASE_URL
    
    async def reverse_geocode(self, coordinates: Coordinates) -> Optional[LocationResponse]:
        """Get address details from coordinates"""
        url = f"{self.base_url}/geocode/reverse"
        params = {
            "lat": coordinates.lat,
            "lon": coordinates.lng,
            "apiKey": self.api_key,
            "format": "json"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('results') and len(data['results']) > 0:
                            result = data['results'][0]
                            
                            return LocationResponse(
                                city=result.get('city', ''),
                                area=result.get('suburb') or result.get('neighbourhood') or result.get('district', ''),
                                address=result.get('formatted', ''),
                                coordinates=coordinates
                            )
                    else:
                        logger.error(f"Geoapify API error: {response.status}")
        except Exception as e:
            logger.error(f"Location service error: {e}")
        
        return None
    
    async def geocode_address(self, address: str) -> Optional[Coordinates]:
        """Get coordinates from address"""
        url = f"{self.base_url}/geocode/search"
        params = {
            "text": address,
            "apiKey": self.api_key,
            "format": "json"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('results') and len(data['results']) > 0:
                            result = data['results'][0]
                            
                            return Coordinates(
                                lat=result.get('lat'),
                                lng=result.get('lon')
                            )
                    else:
                        logger.error(f"Geoapify API error: {response.status}")
        except Exception as e:
            logger.error(f"Location service error: {e}")
        
        return None
    
    async def search_places(self, query: str, coordinates: Optional[Coordinates] = None) -> List[dict]:
        """Search for places near coordinates"""
        url = f"{self.base_url}/geocode/autocomplete"
        params = {
            "text": query,
            "apiKey": self.api_key,
            "format": "json"
        }
        
        if coordinates:
            params["bias"] = f"proximity:{coordinates.lng},{coordinates.lat}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('results', [])
                    else:
                        logger.error(f"Geoapify API error: {response.status}")
        except Exception as e:
            logger.error(f"Location service error: {e}")
        
        return []
    
    def calculate_distance(self, coord1: Coordinates, coord2: Coordinates) -> float:
        """Calculate distance between two coordinates in kilometers"""
        import math
        
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(coord1.lat)
        lat2_rad = math.radians(coord2.lat)
        delta_lat = math.radians(coord2.lat - coord1.lat)
        delta_lng = math.radians(coord2.lng - coord1.lng)
        
        a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lng / 2) * math.sin(delta_lng / 2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

location_service = LocationService()