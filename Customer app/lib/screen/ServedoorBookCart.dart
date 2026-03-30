import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:nb_utils/nb_utils.dart';

import 'ServedoorOrder.dart';

class FoodBookCart extends StatefulWidget {
  static String tag = '/BookCart';

  const FoodBookCart({super.key});

  @override
  FoodBookCartState createState() => FoodBookCartState();
}

class FoodBookCartState extends State<FoodBookCart> {
  Map<String, dynamic> _cart = <String, dynamic>{};
  bool _isLoading = true;
  bool _isPlacingOrder = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  Future<void> _loadCart() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final cart = await ServedoorApi.getCart();
      if (!mounted) return;
      setState(() {
        _cart = cart;
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

  List<dynamic> get _items => (_cart['items'] as List<dynamic>?) ?? <dynamic>[];

  double _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '0') ?? 0.0;
  }

  Future<void> _updateQuantity(Map<String, dynamic> item, int nextQuantity) async {
    final itemId = (item['id'] ?? item['_id'] ?? '').toString();
    final menuItemId = (item['menuItemId'] ?? '').toString();
    if (itemId.isEmpty || menuItemId.isEmpty) {
      toast('Invalid cart item');
      return;
    }

    try {
      final cart = await ServedoorApi.updateCartItem(
        itemId: itemId,
        menuItemId: menuItemId,
        quantity: nextQuantity,
      );
      if (!mounted) return;
      setState(() => _cart = cart);
    } catch (e) {
      toast('Failed to update quantity: $e');
    }
  }

  Future<void> _clearCart() async {
    try {
      final cart = await ServedoorApi.clearCart();
      if (!mounted) return;
      setState(() => _cart = cart);
      toast('Cart cleared');
    } catch (e) {
      toast('Failed to clear cart: $e');
    }
  }

  Future<void> _placeOrder() async {
    if (_items.isEmpty) {
      toast('Your cart is empty');
      return;
    }

    setState(() => _isPlacingOrder = true);
    try {
      final addresses = await ServedoorApi.getAddresses();
      Map<String, dynamic>? selectedAddress;
      if (addresses.isNotEmpty) {
        selectedAddress = addresses.firstWhere(
          (a) => (a as Map<String, dynamic>)['isDefault'] == true,
          orElse: () => addresses.first,
        ) as Map<String, dynamic>;
      }

      final payload = {
        'paymentMethod': 'cod',
        'instructions': 'Order placed from Servedoor customer app',
        if (selectedAddress != null) 'deliveryAddress': selectedAddress,
        if (selectedAddress == null)
          'deliveryAddress': {
            'address': 'Customer address',
            'area': 'Local Area',
            'city': 'City',
            'phone': '0000000000'
          },
      };

      await ServedoorApi.placeOrder(payload);
      if (!mounted) return;
      toast('Order placed successfully');
      const FoodOrder().launch(context);
      await _loadCart();
    } catch (e) {
      toast('Failed to place order: $e');
    } finally {
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    changeStatusColor(food_white);

    return Scaffold(
      backgroundColor: food_white,
      appBar: appBar(context, food_lbl_your_cart, actions: [
        TextButton(
          onPressed: _items.isEmpty ? null : _clearCart,
          child: const Text('Clear Cart'),
        )
      ]),
      bottomNavigationBar: Container(
        color: food_app_background,
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _billRow(food_lbl_sub_total, _toDouble(_cart['subtotal'])),
            _billRow(food_lbl_gst, _toDouble(_cart['taxes'])),
            _billRow('Delivery Fee', _toDouble(_cart['deliveryFee'])),
            _billRow(food_lbl_coupon_discount, -_toDouble(_cart['discount'])),
            const Divider(),
            _billRow('Total', _toDouble(_cart['total']), bold: true),
            10.height,
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isPlacingOrder ? null : _placeOrder,
                style: ElevatedButton.styleFrom(backgroundColor: food_colorPrimary),
                child: Text(_isPlacingOrder ? 'Placing...' : food_lbl_make_payment),
              ),
            )
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Failed to load cart', style: primaryTextStyle(color: food_color_red)),
                      10.height,
                      ElevatedButton(onPressed: _loadCart, child: const Text('Retry')),
                    ],
                  ),
                )
              : _items.isEmpty
                  ? Center(child: Text('Cart is empty', style: primaryTextStyle(size: 16)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _items.length,
                      itemBuilder: (context, index) {
                        final item = (_items[index] as Map).cast<String, dynamic>();
                        final quantity = int.tryParse(item['quantity']?.toString() ?? '0') ?? 0;
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text((item['menuItemName'] ?? 'Item').toString(), style: boldTextStyle()),
                                      4.height,
                                      Text(
                                        'Rs ${_toDouble(item['price']).toStringAsFixed(2)} x $quantity',
                                        style: primaryTextStyle(color: food_textColorSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  onPressed: () => _updateQuantity(item, (quantity - 1).clamp(0, 999)),
                                  icon: const Icon(Icons.remove_circle_outline),
                                ),
                                Text('$quantity', style: primaryTextStyle()),
                                IconButton(
                                  onPressed: () => _updateQuantity(item, quantity + 1),
                                  icon: const Icon(Icons.add_circle_outline),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }

  Widget _billRow(String label, double amount, {bool bold = false}) {
    final textStyle = bold ? boldTextStyle() : primaryTextStyle();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: textStyle),
          Text('Rs ${amount.toStringAsFixed(2)}', style: textStyle),
        ],
      ),
    );
  }
}



