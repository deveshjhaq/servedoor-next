#!/usr/bin/env python3
"""
ServeDoor Backend API Testing Suite
Tests all backend APIs for the food delivery application
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001/api")

class ServeDoorAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n=== Testing Health Endpoints ===")
        
        # Test GET /api/
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("Health Check Root", True, "Root endpoint working")
                else:
                    self.log_test("Health Check Root", False, "Invalid response format", data)
            else:
                self.log_test("Health Check Root", False, f"Status code: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health Check Root", False, "Request failed", str(e))
        
        # Test GET /api/health
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("Health Check Endpoint", True, "Health endpoint working")
                else:
                    self.log_test("Health Check Endpoint", False, "Invalid health status", data)
            else:
                self.log_test("Health Check Endpoint", False, f"Status code: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health Check Endpoint", False, "Request failed", str(e))
    
    def test_seed_endpoint(self):
        """Test restaurant seeding"""
        print("\n=== Testing Seed Endpoint ===")
        
        try:
            response = requests.post(f"{self.base_url}/seed/restaurants", timeout=15)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("count", 0) > 0:
                    self.log_test("Seed Restaurants", True, f"Seeded {data.get('count')} restaurants")
                else:
                    self.log_test("Seed Restaurants", False, "Seeding reported no restaurants", data)
            else:
                self.log_test("Seed Restaurants", False, f"Status code: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Seed Restaurants", False, "Request failed", str(e))
    
    def test_restaurant_endpoints(self):
        """Test restaurant-related endpoints"""
        print("\n=== Testing Restaurant Endpoints ===")
        
        # Test GET /api/restaurants/
        try:
            response = requests.get(f"{self.base_url}/restaurants/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        self.log_test("Get All Restaurants", True, f"Retrieved {len(data)} restaurants")
                        
                        # Test individual restaurant endpoint with first restaurant
                        first_restaurant = data[0]
                        restaurant_id = first_restaurant.get("id")
                        if restaurant_id:
                            self.test_individual_restaurant(restaurant_id)
                    else:
                        self.log_test("Get All Restaurants", False, "No restaurants returned despite seeding")
                else:
                    self.log_test("Get All Restaurants", False, "Response is not a list", data)
            else:
                self.log_test("Get All Restaurants", False, f"Status code: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get All Restaurants", False, "Request failed", str(e))
        
        # Test with filters
        try:
            response = requests.get(f"{self.base_url}/restaurants/?promoted=true", timeout=10)
            if response.status_code == 200:
                data = response.json()
                promoted_count = len([r for r in data if r.get("promoted")])
                self.log_test("Get Promoted Restaurants", True, f"Retrieved {promoted_count} promoted restaurants")
            else:
                self.log_test("Get Promoted Restaurants", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get Promoted Restaurants", False, "Request failed", str(e))
    
    def test_individual_restaurant(self, restaurant_id):
        """Test individual restaurant endpoint"""
        try:
            response = requests.get(f"{self.base_url}/restaurants/{restaurant_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "name" in data and "menu" in data:
                    self.log_test("Get Restaurant by ID", True, f"Retrieved restaurant: {data.get('name')}")
                else:
                    self.log_test("Get Restaurant by ID", False, "Invalid restaurant data", data)
            else:
                self.log_test("Get Restaurant by ID", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get Restaurant by ID", False, "Request failed", str(e))
    
    def test_cuisines_endpoint(self):
        """Test cuisines endpoint"""
        print("\n=== Testing Cuisines Endpoint ===")
        
        try:
            response = requests.get(f"{self.base_url}/cuisines", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Get Cuisines", True, f"Retrieved {len(data)} cuisine categories")
                else:
                    self.log_test("Get Cuisines", False, "No cuisines returned", data)
            else:
                self.log_test("Get Cuisines", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get Cuisines", False, "Request failed", str(e))
    
    def test_user_registration(self):
        """Test user registration"""
        print("\n=== Testing User Registration ===")
        
        # Generate unique test user
        timestamp = int(datetime.now().timestamp())
        test_user = {
            "name": "John Doe",
            "email": f"john.doe.{timestamp}@example.com",
            "password": "securepassword123",
            "phone": "+919876543210"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/users/signup",
                json=test_user,
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    user_data = data["data"]
                    if "token" in user_data and "user" in user_data:
                        self.auth_token = user_data["token"]
                        self.user_id = user_data["user"]["id"]
                        self.log_test("User Registration", True, f"User registered: {user_data['user']['email']}")
                    else:
                        self.log_test("User Registration", False, "Missing token or user data", data)
                else:
                    self.log_test("User Registration", False, "Registration failed", data)
            else:
                self.log_test("User Registration", False, f"Status code: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("User Registration", False, "Request failed", str(e))
    
    def test_user_login(self):
        """Test user login with existing user"""
        print("\n=== Testing User Login ===")
        
        if not self.auth_token:
            self.log_test("User Login", False, "No registered user to test login")
            return
        
        # Try to login with a test user (we'll use the registered user's email)
        # First, let's create another user to test login
        timestamp = int(datetime.now().timestamp()) + 1
        login_user = {
            "name": "Jane Smith",
            "email": f"jane.smith.{timestamp}@example.com",
            "password": "testpassword456",
            "phone": "+919876543211"
        }
        
        # Register the user first
        try:
            reg_response = requests.post(
                f"{self.base_url}/users/signup",
                json=login_user,
                timeout=10
            )
            
            if reg_response.status_code == 200:
                # Now test login
                login_data = {
                    "email": login_user["email"],
                    "password": login_user["password"]
                }
                
                response = requests.post(
                    f"{self.base_url}/users/signin",
                    json=login_data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "data" in data:
                        login_result = data["data"]
                        if "token" in login_result and "user" in login_result:
                            self.log_test("User Login", True, f"Login successful: {login_result['user']['email']}")
                        else:
                            self.log_test("User Login", False, "Missing token or user data", data)
                    else:
                        self.log_test("User Login", False, "Login failed", data)
                else:
                    self.log_test("User Login", False, f"Status code: {response.status_code}", response.text)
            else:
                self.log_test("User Login", False, "Could not create test user for login")
                
        except Exception as e:
            self.log_test("User Login", False, "Request failed", str(e))
    
    def test_protected_endpoints(self):
        """Test protected endpoints that require authentication"""
        print("\n=== Testing Protected Endpoints ===")
        
        if not self.auth_token:
            self.log_test("Protected Endpoints", False, "No auth token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test user profile
        try:
            response = requests.get(f"{self.base_url}/users/profile", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "email" in data:
                    self.log_test("Get User Profile", True, f"Profile retrieved: {data.get('email')}")
                else:
                    self.log_test("Get User Profile", False, "Invalid profile data", data)
            else:
                self.log_test("Get User Profile", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get User Profile", False, "Request failed", str(e))
        
        # Test get cart
        try:
            response = requests.get(f"{self.base_url}/users/cart", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "userId" in data and "items" in data:
                    self.log_test("Get User Cart", True, f"Cart retrieved with {len(data.get('items', []))} items")
                else:
                    self.log_test("Get User Cart", False, "Invalid cart data", data)
            else:
                self.log_test("Get User Cart", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get User Cart", False, "Request failed", str(e))
    
    def test_cart_functionality(self):
        """Test cart add functionality"""
        print("\n=== Testing Cart Functionality ===")
        
        if not self.auth_token:
            self.log_test("Cart Add Item", False, "No auth token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # First get restaurants to find a menu item
        try:
            restaurants_response = requests.get(f"{self.base_url}/restaurants/", timeout=10)
            if restaurants_response.status_code == 200:
                restaurants = restaurants_response.json()
                if restaurants:
                    # Get first restaurant details
                    restaurant_id = restaurants[0]["id"]
                    restaurant_response = requests.get(f"{self.base_url}/restaurants/{restaurant_id}", timeout=10)
                    
                    if restaurant_response.status_code == 200:
                        restaurant_data = restaurant_response.json()
                        if restaurant_data.get("menu"):
                            menu_item = restaurant_data["menu"][0]
                            
                            # Add item to cart
                            cart_request = {
                                "restaurantId": restaurant_id,
                                "menuItemId": menu_item["id"],
                                "quantity": 2
                            }
                            
                            add_response = requests.post(
                                f"{self.base_url}/users/cart/add",
                                json=cart_request,
                                headers=headers,
                                timeout=10
                            )
                            
                            if add_response.status_code == 200:
                                data = add_response.json()
                                if data.get("success"):
                                    self.log_test("Add to Cart", True, f"Added {menu_item['name']} to cart")
                                else:
                                    self.log_test("Add to Cart", False, "Add to cart failed", data)
                            else:
                                self.log_test("Add to Cart", False, f"Status code: {add_response.status_code}")
                        else:
                            self.log_test("Add to Cart", False, "No menu items found")
                    else:
                        self.log_test("Add to Cart", False, "Could not get restaurant details")
                else:
                    self.log_test("Add to Cart", False, "No restaurants available")
            else:
                self.log_test("Add to Cart", False, "Could not get restaurants")
        except Exception as e:
            self.log_test("Add to Cart", False, "Request failed", str(e))
    
    def test_database_persistence(self):
        """Test if data persists in database"""
        print("\n=== Testing Database Persistence ===")
        
        # Check if restaurants persist after seeding
        try:
            response = requests.get(f"{self.base_url}/restaurants/", timeout=10)
            if response.status_code == 200:
                restaurants = response.json()
                if len(restaurants) > 0:
                    self.log_test("Database Persistence", True, f"Database contains {len(restaurants)} restaurants")
                else:
                    self.log_test("Database Persistence", False, "No restaurants found in database")
            else:
                self.log_test("Database Persistence", False, "Could not check database")
        except Exception as e:
            self.log_test("Database Persistence", False, "Request failed", str(e))
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting ServeDoor Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Run tests in logical order
        self.test_health_endpoints()
        self.test_seed_endpoint()
        self.test_restaurant_endpoints()
        self.test_cuisines_endpoint()
        self.test_user_registration()
        self.test_user_login()
        self.test_protected_endpoints()
        self.test_cart_functionality()
        self.test_database_persistence()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for test in self.test_results:
                if not test["success"]:
                    print(f"  • {test['test']}: {test['message']}")
                    if test["details"]:
                        print(f"    Details: {test['details']}")
        
        print("\n" + "=" * 60)
        
        # Return exit code based on results
        return 0 if failed_tests == 0 else 1

if __name__ == "__main__":
    tester = ServeDoorAPITester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)