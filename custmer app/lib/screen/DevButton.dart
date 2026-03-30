import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorConstant.dart';
import 'package:nb_utils/nb_utils.dart';
import 'package:url_launcher/url_launcher.dart';

class DevButton extends StatelessWidget {
  const DevButton({super.key});

  @override
  Widget build(BuildContext context) {
    return AppButton(
      text: 'Checkout More',
      color: food_colorPrimary,
      textStyle: boldTextStyle(color: Colors.white),
      shapeBorder: RoundedRectangleBorder(borderRadius: radius(10)),
      onTap: () {
        launch(DevUrl);
      },
    );
  }
}


