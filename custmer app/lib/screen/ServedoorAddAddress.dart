import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';

import 'DevScreen.dart';

class FoodAddAddress extends StatefulWidget {
  static String tag = '/FoodAddAddress';

  const FoodAddAddress({super.key});

  @override
  FoodAddAddressState createState() => FoodAddAddressState();
}

class FoodAddAddressState extends State<FoodAddAddress> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: food_white,
      appBar: appBar(context, food_lbl_add_address),
      body: const DevScreen(false),
    );
  }
}


