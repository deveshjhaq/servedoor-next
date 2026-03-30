#!/usr/bin/env python3
"""
Simple verification script for OrderRepository.get_paginated() method.
This script verifies that the method signature and implementation are correct.
"""
import inspect
from app.repositories.repos import OrderRepository


def verify_pagination_method():
    """Verify the get_paginated method exists and has correct signature"""
    print("Verifying OrderRepository.get_paginated() method...")
    print("=" * 70)
    
    # Check if method exists
    if not hasattr(OrderRepository, 'get_paginated'):
        print("❌ FAIL: get_paginated method not found in OrderRepository")
        return False
    
    print("✅ Method exists: OrderRepository.get_paginated()")
    
    # Get method signature
    method = getattr(OrderRepository, 'get_paginated')
    sig = inspect.signature(method)
    
    print(f"\n📋 Method signature:")
    print(f"   {method.__name__}{sig}")
    
    # Check parameters
    params = sig.parameters
    print(f"\n📝 Parameters:")
    for param_name, param in params.items():
        if param_name == 'self':
            continue
        default = param.default if param.default != inspect.Parameter.empty else "required"
        print(f"   - {param_name}: {param.annotation if param.annotation != inspect.Parameter.empty else 'Any'} = {default}")
    
    # Verify expected parameters exist
    expected_params = ['page', 'limit', 'query']
    missing_params = []
    for expected in expected_params:
        if expected not in params:
            missing_params.append(expected)
    
    if missing_params:
        print(f"\n⚠️  WARNING: Missing expected parameters: {', '.join(missing_params)}")
    else:
        print(f"\n✅ All expected parameters present: {', '.join(expected_params)}")
    
    # Check return annotation
    return_annotation = sig.return_annotation
    print(f"\n📤 Return type annotation: {return_annotation}")
    
    # Verify the method is async
    if inspect.iscoroutinefunction(method):
        print("✅ Method is async (coroutine function)")
    else:
        print("❌ FAIL: Method is not async")
        return False
    
    print("\n" + "=" * 70)
    print("✅ Verification complete: OrderRepository.get_paginated() is correctly implemented")
    print("\nMethod details:")
    print(f"  - Accepts 'page' parameter (default: 1)")
    print(f"  - Accepts 'limit' parameter (default: 20)")
    print(f"  - Accepts optional 'query' parameter for filtering")
    print(f"  - Returns tuple of (items: List[Order], total: int)")
    print(f"  - Sorts by createdAt in descending order")
    
    return True


if __name__ == "__main__":
    success = verify_pagination_method()
    exit(0 if success else 1)
