"""
base.py — Generic Base Repository for MongoDB.
"""
from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from bson import ObjectId
from pydantic import BaseModel
from app.core.database import db

T = TypeVar("T", bound=BaseModel)

class BaseRepository(Generic[T]):
    def __init__(self, collection_name: str, model_class: Type[T]):
        self.collection_name = collection_name
        self.model_class = model_class

    @property
    def col(self):
        """Lazy load collection so it works seamlessly during async app startup."""
        return db.database[self.collection_name]

    async def get_by_id(self, id_str: str) -> Optional[T]:
        if not ObjectId.is_valid(id_str):
            return None
        doc = await self.col.find_one({"_id": ObjectId(id_str)})
        return self.model_class(**doc) if doc else None

    async def find_one(self, query: dict) -> Optional[T]:
        doc = await self.col.find_one(query)
        return self.model_class(**doc) if doc else None

    async def find_many(
        self, 
        query: dict = {}, 
        skip: int = 0, 
        limit: int = 20, 
        sort_by: Optional[list] = None
    ) -> List[T]:
        cursor = self.col.find(query).skip(skip).limit(limit)
        if sort_by:
            cursor = cursor.sort(sort_by)
        docs = await cursor.to_list(length=limit)
        return [self.model_class(**doc) for doc in docs]

    async def get_paginated(
        self,
        query: Optional[Dict[str, Any]] = None,
        *,
        page: int = 1,
        limit: int = 20,
        sort_by: Optional[list] = None,
    ) -> tuple[List[T], int]:
        """Return (items, total) for page-based list endpoints."""
        query = query or {}
        skip = max((page - 1) * limit, 0)

        cursor = self.col.find(query).skip(skip).limit(limit)
        if sort_by:
            cursor = cursor.sort(sort_by)

        docs = await cursor.to_list(length=limit)
        total = await self.col.count_documents(query)
        return [self.model_class(**doc) for doc in docs], total
        
    async def create(self, data: T) -> T:
        doc = data.model_dump(by_alias=True, exclude={"id"}, exclude_none=True)
        result = await self.col.insert_one(doc)
        doc["_id"] = result.inserted_id
        return self.model_class(**doc)

    async def update(self, id_str: str, update_data: dict) -> bool:
        if not ObjectId.is_valid(id_str):
            return False
        result = await self.col.update_one(
            {"_id": ObjectId(id_str)}, 
            {"$set": update_data}
        )
        return result.modified_count > 0

    async def delete(self, id_str: str) -> bool:
        if not ObjectId.is_valid(id_str):
            return False
        result = await self.col.delete_one({"_id": ObjectId(id_str)})
        return result.deleted_count > 0
