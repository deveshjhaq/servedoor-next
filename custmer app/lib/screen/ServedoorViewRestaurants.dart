import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/screen/DevScreen.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorDataGenerator.dart';
import 'package:servedoor_customer_app/utils/ServedoorModel.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:servedoor_customer_app/utils/ServedoorWidget.dart';
import 'package:nb_utils/nb_utils.dart';

import 'ServedoorBookDetail.dart';
import 'ServedoorRestaurantsDescription.dart';

class FoodViewRestaurants extends StatefulWidget {
  static String tag = '/FoodViewRestaurants';

  const FoodViewRestaurants({super.key});

  @override
  FoodViewRestaurantsState createState() => FoodViewRestaurantsState();
}

class FoodViewRestaurantsState extends State<FoodViewRestaurants> {
  List<DataFilter> list = getAllData();
  List<DataFilter> list1 = getFilterData();

  List<ServedoorRestaurant> mRestaurants = [];
  List<Filter> mList2 = [];
  List<String> mPeopleList = [];
  List<String> mCuisine = [];
  List<String> mFilterList = [];
  var mTime = 0;
  bool _isLoading = true;
  String _errorText = '';

  @override
  void initState() {
    super.initState();
    _fetchRestaurants();

    mPeopleList = ["1", "2", "3", "4", "5"];
    mFilterList = [
      "Pure Veg Places",
      "Express Delivery",
      "Great Offer",
    ];
    mCuisine = [
      "South Indian",
      "American",
      "BBQ",
      "Bakery",
      "Biryani",
      "Burger",
      "Cafe",
      "Charcoal Chicken",
      "Chiness",
      "Fast Food",
      "Juice",
      "Gujarati",
      "Salad",
    ];
  }

  Future<void> _fetchRestaurants() async {
    setState(() {
      _isLoading = true;
      _errorText = '';
    });

    try {
      final data = await ServedoorApi.getRestaurants(page: 1, limit: 30);
      if (!mounted) return;
      setState(() {
        mRestaurants = data;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorText = e.toString();
        _isLoading = false;
      });
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: food_app_background,
      appBar: appBarWidget(
        '',
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list,color: Colors.black),
            onPressed: () {
              const DevScreen(true).launch(context);
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: <Widget>[
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: <Widget>[
                    Container(
                      decoration: BoxDecoration(boxShadow: defaultBoxShadow(), color: white),
                      padding: const EdgeInsets.all(16),
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(food_lbl_lunch_in_delhi_ncr, style: boldTextStyle(size: 20)),
                          const SizedBox(height: 4),
                          mAddress(context),
                          const SizedBox(height: 16),
                          search(context),
                          if (_isLoading)
                            const Padding(
                              padding: EdgeInsets.only(top: 16),
                              child: LinearProgressIndicator(),
                            ),
                          if (_errorText.isNotEmpty)
                            Container(
                              margin: const EdgeInsets.only(top: 16),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      'Failed to load restaurants from backend',
                                      style: primaryTextStyle(color: food_color_red),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: _fetchRestaurants,
                                    child: const Text('Retry'),
                                  )
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                    if (!_isLoading && _errorText.isEmpty && mRestaurants.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(20),
                        child: Text('No restaurants found'),
                      ),
                    if (mRestaurants.isNotEmpty)
                      ListView.builder(
                        scrollDirection: Axis.vertical,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: mRestaurants.length,
                        shrinkWrap: true,
                        itemBuilder: (context, index) {
                          return RestaurantsInfo(mRestaurants[index], index);
                        },
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ignore: must_be_immutable
class RestaurantsInfo extends StatelessWidget {
  ServedoorRestaurant model;
  int? pos;

  RestaurantsInfo(this.model, this.pos, {super.key});

  @override
  Widget build(BuildContext context) {
    var width = MediaQuery.of(context).size.width;

    return GestureDetector(
      onTap: () {
        FoodRestaurantsDescription(restaurantId: model.id).launch(context);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(boxShadow: defaultBoxShadow(), color: white),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            CachedNetworkImage(
              placeholder: placeholderWidgetFn() as Widget Function(BuildContext, String)?,
              imageUrl: model.image,
              width: width,
              height: 250,
              fit: BoxFit.fill,
              errorWidget: (_, __, ___) => Image.asset('images/food/placeholder.jpg', fit: BoxFit.cover, width: width, height: 250),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(model.name, style: primaryTextStyle(size: 18)),
                  const SizedBox(height: 4),
                  Row(children: <Widget>[
                    mRating(model.rating.toStringAsFixed(1)),
                    const SizedBox(width: 4),
                    Text('${model.rating.toStringAsFixed(1)} rating', style: primaryTextStyle(color: food_textColorSecondary)),
                  ]),
                  const SizedBox(height: 4),
                  Row(
                    children: <Widget>[
                      Text(model.cuisine, style: primaryTextStyle(color: food_textColorSecondary)),
                      const SizedBox(width: 4),
                      Container(decoration: const BoxDecoration(shape: BoxShape.circle, color: food_view_color), width: 8, height: 8),
                      const SizedBox(width: 4),
                      Text('${model.area} ${model.city}'.trim(), style: primaryTextStyle(color: food_textColorSecondary)),
                      const SizedBox(width: 4),
                      Container(decoration: const BoxDecoration(shape: BoxShape.circle, color: food_view_color), width: 8, height: 8),
                      const SizedBox(width: 4),
                      Text(model.deliveryTime, style: primaryTextStyle(color: food_textColorSecondary)),
                    ],
                  ),
                  Container(margin: const EdgeInsets.only(top: 16), height: 0.5, color: food_view_color, width: width),
                ],
              ),
            ),
            mViewAll(context, food_lbl_book_a_table, onTap: () {
              const FoodBookDetail().launch(context);
            }),
          ],
        ),
      ),
    );
  }
}



