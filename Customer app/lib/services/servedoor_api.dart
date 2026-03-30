import 'dart:convert';

import 'package:http/http.dart' as http;

import '../utils/ServedoorConstant.dart';

class ServedoorRestaurant {
  final String id;
  final String name;
  final String image;
  final double rating;
  final String cuisine;
  final String deliveryTime;
  final String area;
  final String city;

  ServedoorRestaurant({
    required this.id,
    required this.name,
    required this.image,
    required this.rating,
    required this.cuisine,
    required this.deliveryTime,
    required this.area,
    required this.city,
  });

  factory ServedoorRestaurant.fromJson(Map<String, dynamic> json) {
    final location = (json['location'] as Map<String, dynamic>?) ?? const {};

    return ServedoorRestaurant(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? 'Restaurant').toString(),
      image: (json['image'] ?? '').toString(),
      rating: (json['rating'] ?? 0).toDouble(),
      cuisine: (json['cuisine'] ?? '').toString(),
      deliveryTime: (json['deliveryTime'] ?? '').toString(),
      area: (location['area'] ?? '').toString(),
      city: (location['city'] ?? '').toString(),
    );
  }
}

class ServedoorApi {
  static String? authToken;

  static Map<String, String> _headers({bool withAuth = false}) {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (withAuth && authToken != null && authToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    return headers;
  }

  static Future<List<ServedoorRestaurant>> getRestaurants({
    int page = 1,
    int limit = 20,
    String? search,
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/restaurants/').replace(
      queryParameters: {
        'page': '$page',
        'limit': '$limit',
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      },
    );

    final res = await http.get(uri, headers: _headers());

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch restaurants (${res.statusCode})');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = body['data'];

    if (data is! List) {
      return <ServedoorRestaurant>[];
    }

    return data
        .whereType<Map<String, dynamic>>()
        .map(ServedoorRestaurant.fromJson)
        .toList();
  }

  static Future<List<dynamic>> getRestaurantMenu(String restaurantId) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/restaurants/$restaurantId/menu');
    final res = await http.get(uri, headers: _headers());

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch menu');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    final menu = data['menu'];
    return menu is List ? menu : <dynamic>[];
  }

  static Future<Map<String, dynamic>> getRestaurantDetails(String restaurantId) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/restaurants/$restaurantId');
    final res = await http.get(uri, headers: _headers());

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch restaurant details');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['restaurant'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, List<dynamic>>> getRestaurantGallery(String restaurantId) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/restaurants/$restaurantId/gallery');
    final res = await http.get(uri, headers: _headers());

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch gallery');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};

    List<dynamic> _listFor(String key) {
      final value = data[key];
      return value is List ? value : <dynamic>[];
    }

    return {
      'all': _listFor('all'),
      'food': _listFor('food'),
      'ambience': _listFor('ambience'),
      'user': _listFor('user'),
    };
  }

  static Future<Map<String, dynamic>> getRestaurantReviews(
    String restaurantId, {
    int page = 1,
    int limit = 20,
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/restaurants/$restaurantId/reviews').replace(
      queryParameters: {'page': '$page', 'limit': '$limit'},
    );
    final res = await http.get(uri, headers: _headers());

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch reviews');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return (body['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> getCart() async {
    final uri = Uri.parse('$servedoorApiBaseUrl/cart/');
    final res = await http.get(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch cart');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['cart'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> addToCart({
    required String restaurantId,
    required String restaurantName,
    required String menuItemId,
    required String menuItemName,
    required double price,
    required int quantity,
    bool isVeg = true,
    List<String> customizations = const [],
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/cart/items');
    final res = await http.post(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode({
        'restaurantId': restaurantId,
        'restaurantName': restaurantName,
        'menuItemId': menuItemId,
        'menuItemName': menuItemName,
        'price': price,
        'quantity': quantity,
        'isVeg': isVeg,
        'customizations': customizations,
      }),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to add item to cart');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['cart'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> updateCartItem({
    required String itemId,
    required String menuItemId,
    required int quantity,
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/cart/items/$itemId');
    final res = await http.put(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode({'menuItemId': menuItemId, 'quantity': quantity}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to update cart item');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['cart'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> clearCart() async {
    final uri = Uri.parse('$servedoorApiBaseUrl/cart/');
    final res = await http.delete(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to clear cart');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['cart'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> placeOrder(Map<String, dynamic> payload) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/orders/');
    final res = await http.post(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode(payload),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to place order');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return data;
  }

  static Future<List<dynamic>> getMyOrders({int page = 1, int limit = 10}) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/orders/').replace(
      queryParameters: {'page': '$page', 'limit': '$limit'},
    );

    final res = await http.get(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch orders');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = body['data'];
    return data is List ? data : <dynamic>[];
  }

  static Future<Map<String, dynamic>> getOrderDetails(String orderId) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/orders/$orderId');
    final res = await http.get(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch order details');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['order'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> getProfile() async {
    final uri = Uri.parse('$servedoorApiBaseUrl/users/profile');
    final res = await http.get(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch profile');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['user'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> updateProfile({String? name, String? email}) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/users/profile');
    final payload = <String, dynamic>{};
    if (name != null) payload['name'] = name;
    if (email != null) payload['email'] = email;

    final res = await http.put(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode(payload),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to update profile');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['user'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<List<dynamic>> getAddresses() async {
    final uri = Uri.parse('$servedoorApiBaseUrl/users/addresses');
    final res = await http.get(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch addresses');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    final addresses = data['addresses'];
    return addresses is List ? addresses : <dynamic>[];
  }

  static Future<List<dynamic>> getFavoriteRestaurants() async {
    final uri = Uri.parse('$servedoorApiBaseUrl/users/favorites');
    final res = await http.get(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch favorites');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    final favorites = data['favorites'];
    return favorites is List ? favorites : <dynamic>[];
  }

  static Future<void> addFavoriteRestaurant(String restaurantId) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/users/favorites');
    final res = await http.post(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode({'restaurantId': restaurantId}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to add favorite');
    }
  }

  static Future<void> removeFavoriteRestaurant(String restaurantId) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/users/favorites/$restaurantId');
    final res = await http.delete(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to remove favorite');
    }
  }

  static Future<List<dynamic>> getPaymentMethods() async {
    final uri = Uri.parse('$servedoorApiBaseUrl/payments/methods');
    final res = await http.get(uri, headers: _headers());

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch payment methods');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    final methods = data['methods'];
    return methods is List ? methods : <dynamic>[];
  }

  static Future<Map<String, dynamic>> createRazorpayOrder({
    required String orderId,
    required double amount,
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/payments/razorpay/create');
    final res = await http.post(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode({'orderId': orderId, 'amount': amount}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to create Razorpay order');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return (body['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> verifyRazorpayPayment({
    required String orderId,
    required String paymentId,
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/payments/razorpay/verify');
    final res = await http.post(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode({'orderId': orderId, 'paymentId': paymentId}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to verify Razorpay payment');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return (body['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> createCashfreeOrder({
    required String orderId,
    required double amount,
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/payments/cashfree/create');
    final res = await http.post(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode({'orderId': orderId, 'amount': amount}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to create Cashfree order');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return (body['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<Map<String, dynamic>> verifyCashfreePayment({
    required String orderId,
    required String paymentId,
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/payments/cashfree/verify');
    final res = await http.post(
      uri,
      headers: _headers(withAuth: true),
      body: jsonEncode({'orderId': orderId, 'paymentId': paymentId}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to verify Cashfree payment');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return (body['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
  }

  static Future<double> getWalletBalance() async {
    final uri = Uri.parse('$servedoorApiBaseUrl/users/wallet/balance');
    final res = await http.get(uri, headers: _headers(withAuth: true));

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Failed to fetch wallet balance');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    return (data['balance'] as num?)?.toDouble() ?? 0.0;
  }

  static Future<void> sendOtp(String phone) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/auth/send-otp');
    final res = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({'phone': phone}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Unable to send OTP');
    }
  }

  static Future<void> verifyOtp({
    required String phone,
    required String otp,
    String name = '',
    String? email,
  }) async {
    final uri = Uri.parse('$servedoorApiBaseUrl/auth/verify-otp');
    final res = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({
        'phone': phone,
        'otp': otp,
        'name': name,
        'email': email,
      }),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Invalid OTP');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final data = (body['data'] as Map<String, dynamic>?) ?? const {};
    final token = data['access_token']?.toString() ?? data['token']?.toString();

    if (token == null || token.isEmpty) {
      throw Exception('Access token not returned by backend');
    }

    authToken = token;
  }
}

