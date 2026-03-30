import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:nb_utils/nb_utils.dart';

class FoodGallery extends StatefulWidget {
  static String tag = '/FoodGallery';
  final String restaurantId;

  const FoodGallery({super.key, required this.restaurantId});

  @override
  FoodGalleryState createState() => FoodGalleryState();
}

class FoodGalleryState extends State<FoodGallery> {
  Map<String, List<dynamic>> _gallery = {
    'all': <dynamic>[],
    'ambience': <dynamic>[],
    'food': <dynamic>[],
    'user': <dynamic>[],
  };
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadGallery();
  }

  Future<void> _loadGallery() async {
    setState(() => _loading = true);
    try {
      final data = await ServedoorApi.getRestaurantGallery(widget.restaurantId);
      if (!mounted) return;
      setState(() {
        _gallery = data;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      toast('Unable to load gallery: $e');
    }
  }

  Widget _grid(List<dynamic> images) {
    if (images.isEmpty) {
      return const Center(child: Text('No photos available'));
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: images.length,
      itemBuilder: (context, index) {
        final image = images[index].toString();
        return ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: CachedNetworkImage(
            imageUrl: image,
            fit: BoxFit.cover,
            placeholder: (_, __) => Container(color: food_view_color),
            errorWidget: (_, __, ___) => Container(color: food_view_color),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: Text(food_lbl_photo, style: boldTextStyle(color: food_textColorPrimary)),
          iconTheme: const IconThemeData(color: food_textColorPrimary),
          backgroundColor: food_white,
          bottom: TabBar(
            labelColor: food_textColorPrimary,
            unselectedLabelColor: food_textColorSecondary,
            indicatorColor: food_colorAccent,
            tabs: const [
              Tab(text: 'All'),
              Tab(text: 'Ambience'),
              Tab(text: 'Food'),
              Tab(text: 'User'),
            ],
          ),
        ),
        backgroundColor: food_app_background,
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : TabBarView(
                children: [
                  _grid(_gallery['all'] ?? <dynamic>[]),
                  _grid(_gallery['ambience'] ?? <dynamic>[]),
                  _grid(_gallery['food'] ?? <dynamic>[]),
                  _grid(_gallery['user'] ?? <dynamic>[]),
                ],
              ),
      ),
    );
  }
}
