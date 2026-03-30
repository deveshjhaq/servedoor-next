#!/usr/bin/env python3
"""
Test script to verify OrderRepository.get_paginated() method
Tests that the method accepts page and limit parameters and returns (items, total) tuple.
"""
import pytest
from app.repositories.repos import order_repo


@pytest.mark.asyncio
async def test_order_pagination_basic():
    """Test basic pagination without query filter"""
    items, total = await order_repo.get_paginated(page=1, limit=10)
    
    # Verify return type
    assert isinstance(items, list), f"Expected list, got {type(items)}"
    assert isinstance(total, int), f"Expected int, got {type(total)}"
    
    # Verify total is non-negative
    assert total >= 0, f"Total should be non-negative, got {total}"
    
    # Verify items count doesn't exceed limit
    assert len(items) <= 10, f"Items count should not exceed limit of 10, got {len(items)}"


@pytest.mark.asyncio
async def test_order_pagination_with_query():
    """Test pagination with query filter"""
    test_user_id = "test_user_123"
    items, total = await order_repo.get_paginated(
        page=1, 
        limit=5, 
        query={"userId": test_user_id}
    )
    
    # Verify return type
    assert isinstance(items, list), f"Expected list, got {type(items)}"
    assert isinstance(total, int), f"Expected int, got {type(total)}"
    
    # Verify items count doesn't exceed limit
    assert len(items) <= 5, f"Items count should not exceed limit of 5, got {len(items)}"


@pytest.mark.asyncio
async def test_order_pagination_different_pages():
    """Test different page numbers"""
    items_page1, total_page1 = await order_repo.get_paginated(page=1, limit=5)
    items_page2, total_page2 = await order_repo.get_paginated(page=2, limit=5)
    
    # Total should be the same across pages
    assert total_page1 == total_page2, "Total count should be consistent across pages"
    
    # Verify return types
    assert isinstance(items_page1, list), "Page 1 items should be a list"
    assert isinstance(items_page2, list), "Page 2 items should be a list"


@pytest.mark.asyncio
async def test_order_pagination_return_type():
    """Verify return type is tuple[list, int]"""
    result = await order_repo.get_paginated(page=1, limit=10)
    
    # Verify it's a tuple
    assert isinstance(result, tuple), f"Expected tuple, got {type(result)}"
    assert len(result) == 2, f"Expected tuple of length 2, got {len(result)}"
    
    # Verify tuple elements
    items, total = result
    assert isinstance(items, list), f"Expected first element to be list, got {type(items)}"
    assert isinstance(total, int), f"Expected second element to be int, got {type(total)}"


@pytest.mark.asyncio
async def test_order_pagination_parameters():
    """Test that method accepts page, limit, and query parameters"""
    # Test with all parameters
    items, total = await order_repo.get_paginated(
        page=2,
        limit=20,
        query={"status": "delivered"}
    )
    
    assert isinstance(items, list), "Should return list of items"
    assert isinstance(total, int), "Should return total count"
    assert len(items) <= 20, "Should respect limit parameter"
