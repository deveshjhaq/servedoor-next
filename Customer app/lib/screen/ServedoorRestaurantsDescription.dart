import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:nb_utils/nb_utils.dart';

import 'ServedoorDescription.dart';
import 'ServedoorGallery.dart';
import 'ServedoorReview.dart';

class FoodRestaurantsDescription extends StatefulWidget {
  static String tag = '/FoodRestaurantsDescription';
  final String restaurantId;

  const FoodRestaurantsDescription({super.key, required this.restaurantId});

  @override
  FoodRestaurantsDescriptionState createState() => FoodRestaurantsDescriptionState();
}

class FoodRestaurantsDescriptionState extends State<FoodRestaurantsDescription> {
  Map<String, dynamic>? _restaurant;
  List<dynamic> _menu = [];
  Map<String, dynamic> _reviewMeta = {};
  bool _loading = true;
  bool _favoriteBusy = false;
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final restaurant = await ServedoorApi.getRestaurantDetails(widget.restaurantId);
      final menu = await ServedoorApi.getRestaurantMenu(widget.restaurantId);
      final reviewMeta = await ServedoorApi.getRestaurantReviews(widget.restaurantId, page: 1, limit: 5);
      final favorites = await ServedoorApi.getFavoriteRestaurants();

      final isFavorite = favorites.any((item) {
        if (item is! Map) return false;
        final id = (item['_id'] ?? item['id'] ?? '').toString();
        return id == widget.restaurantId;
      });

      if (!mounted) return;
      setState(() {
        _restaurant = restaurant;
        _menu = menu;
        _reviewMeta = reviewMeta;
        _isFavorite = isFavorite;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      toast('Unable to load restaurant details: $e');
    }
  }

  Future<void> _toggleFavorite() async {
    if (_favoriteBusy) return;
    setState(() => _favoriteBusy = true);
    try {
      if (_isFavorite) {
        await ServedoorApi.removeFavoriteRestaurant(widget.restaurantId);
      } else {
        await ServedoorApi.addFavoriteRestaurant(widget.restaurantId);
      }
      if (!mounted) return;
      setState(() => _isFavorite = !_isFavorite);
      toast(_isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (e) {
      toast('Could not update favorite: $e');
    } finally {
      if (mounted) setState(() => _favoriteBusy = false);
    }
  }

  Widget _sectionCard({required String title, required List<Widget> children}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: boldTextStyle(size: 16)),
            const SizedBox(height: 10),
            ...children,
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final restaurant = _restaurant ?? {};
    final location = (restaurant['location'] as Map?)?.cast<String, dynamic>() ?? {};
    final offers = (restaurant['offers'] as List?) ?? const [];
    final menuPreview = _menu.take(4).toList();
    final avgRating = ((_reviewMeta['averageRating'] as num?) ?? (restaurant['rating'] as num?) ?? 0).toDouble();
    final reviewCount = (_reviewMeta['count'] as num?)?.toInt() ?? 0;

    return Scaffold(
      backgroundColor: food_app_background,
      appBar: AppBar(
        backgroundColor: food_white,
        iconTheme: const IconThemeData(color: food_textColorPrimary),
        title: Text((restaurant['name'] ?? 'Restaurant').toString(), style: boldTextStyle(color: food_textColorPrimary)),
        actions: [
          IconButton(
            icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border, color: food_color_red),
            onPressed: _toggleFavorite,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: CachedNetworkImage(
                      imageUrl: (restaurant['image'] ?? '').toString(),
                      height: 220,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(height: 220, color: food_view_color),
                    ),
                  ),
                  const SizedBox(height: 10),
                  _sectionCard(
                    title: 'Overview',
                    children: [
                      Text((restaurant['cuisine'] ?? '').toString()),
                      const SizedBox(height: 4),
                      Text('${location['area'] ?? ''}, ${location['city'] ?? ''}'),
                      const SizedBox(height: 4),
                      Text('Delivery Time: ${(restaurant['deliveryTime'] ?? '').toString()}'),
                      const SizedBox(height: 4),
                      Text('Rating: ${avgRating.toStringAsFixed(1)} ⭐ ($reviewCount reviews)'),
                    ],
                  ),
                  _sectionCard(
                    title: 'Offers & Sections',
                    children: [
                      if (offers.isEmpty) const Text('No active offers'),
                      ...offers.map((e) => Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Text('• ${e.toString()}'),
                          )),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          OutlinedButton.icon(
                            onPressed: () => FoodGallery(restaurantId: widget.restaurantId).launch(context),
                            icon: const Icon(Icons.photo_library_outlined),
                            label: const Text('Gallery'),
                          ),
                          OutlinedButton.icon(
                            onPressed: () => FoodReview(restaurantId: widget.restaurantId).launch(context),
                            icon: const Icon(Icons.reviews_outlined),
                            label: const Text('Reviews'),
                          ),
                          OutlinedButton.icon(
                            onPressed: () => FoodDescription(restaurantId: widget.restaurantId).launch(context),
                            icon: const Icon(Icons.shopping_bag_outlined),
                            label: const Text('Order Online'),
                          ),
                        ],
                      )
                    ],
                  ),
                  _sectionCard(
                    title: 'Popular Dishes',
                    children: [
                      if (menuPreview.isEmpty) const Text('No menu items available.'),
                      ...menuPreview.map((item) {
                        final data = (item as Map).cast<String, dynamic>();
                        final price = ((data['price'] as num?) ?? 0).toDouble();
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text((data['name'] ?? 'Item').toString()),
                          subtitle: Text((data['description'] ?? '').toString()),
                          trailing: Text('₹ ${price.toStringAsFixed(0)}', style: boldTextStyle(color: food_colorPrimary)),
                        );
                      }),
                    ],
                  ),
                  _sectionCard(
                    title: 'Plan Your Visit',
                    children: [
                      Text('Address: ${(location['address'] ?? '').toString()}'),
                      const SizedBox(height: 4),
                      Text('Area: ${(location['area'] ?? '').toString()}'),
                      const SizedBox(height: 4),
                      Text('City: ${(location['city'] ?? '').toString()}'),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}
