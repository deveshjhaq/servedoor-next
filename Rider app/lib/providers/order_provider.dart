import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import '../models/httpexception.dart';

class Order with ChangeNotifier {
  static const String _apiAuthority = '10.0.2.2:8001';

  List<OrderItem> _orderItem = [];

  List<OrderItem> get OrderItems {
    return [..._orderItem];
  }

  OrderItem findById(String id) {
    return _orderItem.firstWhere((order) => order.orderid == id);
  }

  Future<String> _token() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null || token.isEmpty) {
      throw HttpException('Rider token missing');
    }
    return token;
  }

  Future<void> acceptOrder(String orderid, BuildContext context) async {
    try {
      final token = await _token();
      final url = Uri.http(_apiAuthority, 'api/rider/accept-order');
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'order_id': orderid}),
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('Unable to accept order');
      }
      await getorder();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> verifyOrder(String orderid, BuildContext context) async {
    try {
      final token = await _token();
      final url = Uri.http(_apiAuthority, 'api/rider/update-status');
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'order_id': orderid, 'status': 'Verified'}),
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('Unable to verify order');
      }
      await getorder();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> cancelOrder(String orderid, BuildContext context) async {
    try {
      final token = await _token();
      final url = Uri.http(_apiAuthority, 'api/rider/update-status');
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'order_id': orderid, 'status': 'Cancelled'}),
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('Unable to cancel order');
      }
      await getorder();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deliverOrder(String orderid, BuildContext context) async {
    try {
      final token = await _token();
      final url = Uri.http(_apiAuthority, 'api/rider/update-status');
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'order_id': orderid, 'status': 'Delivered'}),
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('Unable to mark delivered');
      }
      await getorder();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> getorder() async {
    try {
      _orderItem.clear();
      final token = await _token();
      final url = Uri.http(_apiAuthority, 'api/rider/new-orders');
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException("Couldn't get orders");
      }

      final body = json.decode(response.body) as Map<String, dynamic>;
      final data = (body['data'] as Map<String, dynamic>?) ?? {};
      final list = (data['orders'] as List?) ?? [];

      final List<OrderItem> orderitem = [];
      for (final element in list) {
        final map = (element as Map).cast<String, dynamic>();
        final List<FoodItem> food = [];
        final List<Restaurantlocation> restaurantLocation = [];

        for (final ele in (map['items'] as List? ?? [])) {
          final item = (ele as Map).cast<String, dynamic>();
          food.add(
            FoodItem(
              cost: (item['cost'] ?? '').toString(),
              name: (item['food_name'] ?? '').toString(),
              price: (item['price'] ?? '').toString(),
              quantity: (item['quantity'] as num?)?.toInt() ?? 0,
              restaurantname: (item['restaurant_name'] ?? '').toString(),
            ),
          );
        }

        for (final ele in (map['restaurant_location'] as List? ?? [])) {
          final location = (ele as Map).cast<String, dynamic>();
          restaurantLocation.add(
            Restaurantlocation(
              name: (location['name'] ?? '').toString(),
              location: (location['location'] as List?) ?? [],
              distance: (location['distance'] as num?)?.toInt() ?? 0,
            ),
          );
        }

        final customer = (map['customer'] as Map?)?.cast<String, dynamic>() ?? {};
        orderitem.add(
          OrderItem(
            customerName: (customer['full_name'] ?? '').toString(),
            mobileNumber: (customer['mobile'] ?? '').toString(),
            distance: (customer['distance'] as num?)?.toInt() ?? 0,
            orderid: (map['order_id'] ?? '').toString(),
            deliverycharge: (map['delivery_charge'] ?? '').toString(),
            food: food,
            deliverylocation: (map['delivery_location'] as List?) ?? [],
            paymentmethod: (map['payment_method'] ?? '').toString(),
            status: (map['status'] ?? '').toString(),
            totalamount: (map['total_amount'] ?? '').toString(),
            location: restaurantLocation,
          ),
        );
      }

      _orderItem = orderitem;
      notifyListeners();
    } catch (error) {
      throw HttpException("Couldn't get the order");
    }
  }
}

class OrderItem {
  String? customerName;
  String? mobileNumber;
  int? distance;
  String? orderid;
  String? totalamount;
  String? deliverycharge;
  List? deliverylocation;
  String? paymentmethod;
  String? status;
  List<FoodItem>? food;
  List<Restaurantlocation>? location;
  OrderItem({
    this.customerName,
    this.mobileNumber,
    this.distance,
    this.orderid,
    this.deliverycharge,
    this.deliverylocation,
    this.food,
    this.paymentmethod,
    this.status,
    this.totalamount,
    this.location,
  });
}

class FoodItem {
  int? quantity;
  String? price;
  String? name;
  String? cost;
  String? restaurantname;

  FoodItem({
    this.quantity,
    this.price,
    this.name,
    this.cost,
    this.restaurantname,
  });
}

class Restaurantlocation {
  String? name;
  List? location;
  int? distance;
  Restaurantlocation({
    this.name,
    this.location,
    this.distance,
  });
}
