import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:nb_utils/nb_utils.dart';

class FoodPayment extends StatefulWidget {
  static String tag = '/FoodPayment';

  const FoodPayment({super.key});

  @override
  FoodPaymentState createState() => FoodPaymentState();
}

class FoodPaymentState extends State<FoodPayment> {
  List<Map<String, dynamic>> _methods = [];
  List<Map<String, dynamic>> _orders = [];
  double _walletBalance = 0;
  bool _loading = true;
  bool _paying = false;
  String _selectedMethod = 'online';

  @override
  void initState() {
    super.initState();
    _loadPaymentData();
  }

  Future<void> _loadPaymentData() async {
    setState(() => _loading = true);
    try {
      final methods = await ServedoorApi.getPaymentMethods();
      final orders = await ServedoorApi.getMyOrders(page: 1, limit: 20);
      final walletBalance = await ServedoorApi.getWalletBalance();
      if (!mounted) return;
      setState(() {
        _methods = methods.whereType<Map>().map((e) => e.cast<String, dynamic>()).toList();
        _orders = orders.whereType<Map>().map((e) => e.cast<String, dynamic>()).toList();
        _walletBalance = walletBalance;
        if (_methods.isNotEmpty) {
          _selectedMethod = (_methods.first['id'] ?? 'online').toString();
        }
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      toast('Unable to load payments: $e');
    }
  }

  Map<String, dynamic>? get _pendingOrder {
    for (final order in _orders) {
      final paymentStatus = (order['paymentStatus'] ?? '').toString().toLowerCase();
      final total = ((order['total'] as num?) ?? 0).toDouble();
      if (paymentStatus != 'completed' && total > 0) {
        return order;
      }
    }
    return null;
  }

  Future<void> _payNow() async {
    final order = _pendingOrder;
    if (order == null) {
      toast('No pending payment order found');
      return;
    }

    final orderId = (order['_id'] ?? order['id'] ?? '').toString();
    final amount = ((order['total'] as num?) ?? 0).toDouble();
    if (orderId.isEmpty || amount <= 0) {
      toast('Invalid order for payment');
      return;
    }

    setState(() => _paying = true);
    try {
      if (_selectedMethod == 'online') {
        final created = await ServedoorApi.createRazorpayOrder(orderId: orderId, amount: amount);
        final gatewayOrderId = (created['gatewayOrderId'] ?? '').toString();
        final mockPaymentId = 'pay_${gatewayOrderId.isEmpty ? DateTime.now().millisecondsSinceEpoch : gatewayOrderId}';
        await ServedoorApi.verifyRazorpayPayment(orderId: orderId, paymentId: mockPaymentId);
        toast('Payment successful');
      } else if (_selectedMethod == 'wallet') {
        if (_walletBalance < amount) {
          toast('Insufficient wallet balance');
          return;
        }
        final created = await ServedoorApi.createCashfreeOrder(orderId: orderId, amount: amount);
        final session = (created['paymentSessionId'] ?? DateTime.now().millisecondsSinceEpoch).toString();
        await ServedoorApi.verifyCashfreePayment(orderId: orderId, paymentId: 'wallet_$session');
        toast('Wallet payment successful');
      } else {
        toast('Cash on Delivery selected. Pay on delivery.');
      }

      await _loadPaymentData();
    } catch (e) {
      toast('Payment failed: $e');
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pending = _pendingOrder;
    final amount = ((pending?['total'] as num?) ?? 0).toDouble();

    return Scaffold(
      backgroundColor: food_app_background,
      appBar: appBar(context, food_lbl_payment),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadPaymentData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: ListTile(
                      title: Text('Wallet Balance', style: boldTextStyle()),
                      subtitle: Text('₹ ${_walletBalance.toStringAsFixed(2)}'),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Card(
                    child: ListTile(
                      title: Text('Pending Amount', style: boldTextStyle()),
                      subtitle: Text(pending == null ? 'No pending order' : 'Order: ${(pending['orderId'] ?? '').toString()}'),
                      trailing: Text('₹ ${amount.toStringAsFixed(2)}', style: boldTextStyle(color: food_colorPrimary)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text('Choose Payment Method', style: boldTextStyle()),
                  const SizedBox(height: 8),
                  ..._methods.map((method) {
                    final id = (method['id'] ?? '').toString();
                    final name = (method['name'] ?? id).toString();
                    final isActive = method['isActive'] != false;
                    return RadioListTile<String>(
                      value: id,
                      groupValue: _selectedMethod,
                      onChanged: isActive
                          ? (value) {
                              if (value == null) return;
                              setState(() => _selectedMethod = value);
                            }
                          : null,
                      title: Text(name),
                    );
                  }),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _paying ? null : _payNow,
                    style: ElevatedButton.styleFrom(backgroundColor: food_colorPrimary),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: _paying
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text('Pay ₹ ${amount.toStringAsFixed(2)}', style: boldTextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
