import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:nb_utils/nb_utils.dart';

class FoodOrder extends StatefulWidget {
  static String tag = '/FoodOrder';

  const FoodOrder({super.key});

  @override
  FoodOrderState createState() => FoodOrderState();
}

class FoodOrderState extends State<FoodOrder> {
  bool _isLoading = true;
  String _error = '';
  List<dynamic> _orders = <dynamic>[];

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final orders = await ServedoorApi.getMyOrders(page: 1, limit: 20);
      if (!mounted) return;
      setState(() {
        _orders = orders;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'placed':
        return Colors.blue;
      case 'confirmed':
        return Colors.green;
      case 'preparing':
        return Colors.orange;
      case 'on_way':
        return Colors.deepPurple;
      case 'delivered':
        return Colors.green.shade700;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Future<void> _showOrderDetails(Map<String, dynamic> order) async {
    final orderId = (order['_id'] ?? order['id'] ?? '').toString();
    if (orderId.isEmpty) return;

    try {
      final detail = await ServedoorApi.getOrderDetails(orderId);
      if (!mounted) return;
      final tracking = (detail['tracking'] as List<dynamic>?) ?? <dynamic>[];

      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (_) {
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Order #${detail['orderId'] ?? orderId}', style: boldTextStyle(size: 18)),
                  8.height,
                  Text('Status: ${(detail['status'] ?? '-').toString()}',
                      style: primaryTextStyle(color: _statusColor((detail['status'] ?? '').toString()))),
                  12.height,
                  Text('Tracking', style: boldTextStyle(size: 16)),
                  8.height,
                  if (tracking.isEmpty)
                    Text('No tracking updates available yet', style: primaryTextStyle(color: food_textColorSecondary)),
                  if (tracking.isNotEmpty)
                    ...tracking.map((t) {
                      final item = (t as Map).cast<String, dynamic>();
                      return ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.circle, size: 10),
                        title: Text((item['message'] ?? item['status'] ?? '').toString()),
                        subtitle: Text((item['timestamp'] ?? '').toString()),
                      );
                    }),
                ],
              ),
            ),
          );
        },
      );
    } catch (e) {
      toast('Failed to load order details: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    changeStatusColor(food_white);

    return Scaffold(
      backgroundColor: food_white,
      appBar: appBar(context, food_lbl_orders),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Failed to load orders', style: primaryTextStyle(color: food_color_red)),
                      10.height,
                      ElevatedButton(onPressed: _loadOrders, child: const Text('Retry')),
                    ],
                  ),
                )
              : _orders.isEmpty
                  ? Center(child: Text('No orders yet', style: primaryTextStyle(size: 16)))
                  : RefreshIndicator(
                      onRefresh: _loadOrders,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _orders.length,
                        itemBuilder: (context, index) {
                          final order = (_orders[index] as Map).cast<String, dynamic>();
                          final status = (order['status'] ?? '').toString();
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              title: Text('#${order['orderId'] ?? order['_id'] ?? ''}', style: boldTextStyle()),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text((order['restaurantName'] ?? '-').toString()),
                                  Text('Total: Rs ${(order['total'] ?? 0).toString()}'),
                                ],
                              ),
                              trailing: Chip(
                                label: Text(status.replaceAll('_', ' ')),
                                backgroundColor: _statusColor(status).withOpacity(0.12),
                                labelStyle: TextStyle(color: _statusColor(status)),
                              ),
                              onTap: () => _showOrderDetails(order),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}


