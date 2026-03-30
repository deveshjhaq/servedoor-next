import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:nb_utils/nb_utils.dart';

class FoodFavourite extends StatefulWidget {
  static String tag = '/FoodFavourite';

  const FoodFavourite({super.key});

  @override
  FoodFavouriteState createState() => FoodFavouriteState();
}

class FoodFavouriteState extends State<FoodFavourite> {
  List<Map<String, dynamic>> _favorites = [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final items = await ServedoorApi.getFavoriteRestaurants();
      if (!mounted) return;
      setState(() {
        _favorites = items.whereType<Map>().map((e) => e.cast<String, dynamic>()).toList();
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Unable to load favorites';
        _loading = false;
      });
    }
  }

  Future<void> _removeFavorite(String restaurantId) async {
    try {
      await ServedoorApi.removeFavoriteRestaurant(restaurantId);
      toast('Removed from favorites');
      await _loadFavorites();
    } catch (e) {
      toast('Failed to remove favorite: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: food_app_background,
      appBar: appBar(context, food_lbl_favourite),
      body: RefreshIndicator(
        onRefresh: _loadFavorites,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error.isNotEmpty
                ? ListView(
                    children: [
                      const SizedBox(height: 120),
                      Center(child: Text(_error, style: primaryTextStyle(color: food_color_red))),
                      TextButton(onPressed: _loadFavorites, child: const Text('Retry')),
                    ],
                  )
                : _favorites.isEmpty
                    ? ListView(
                        children: const [
                          SizedBox(height: 140),
                          Center(child: Text('No favorite restaurants yet')),
                        ],
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _favorites.length,
                        itemBuilder: (context, index) {
                          final item = _favorites[index];
                          final id = (item['_id'] ?? item['id'] ?? '').toString();
                          final image = (item['image'] ?? '').toString();
                          final name = (item['name'] ?? 'Restaurant').toString();
                          final rating = ((item['rating'] as num?) ?? 0).toDouble();
                          final cuisine = (item['cuisine'] ?? '').toString();

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: image.isEmpty
                                    ? Container(width: 52, height: 52, color: food_view_color)
                                    : CachedNetworkImage(imageUrl: image, width: 52, height: 52, fit: BoxFit.cover),
                              ),
                              title: Text(name, style: boldTextStyle()),
                              subtitle: Text('$cuisine • ${rating.toStringAsFixed(1)} ⭐'),
                              trailing: IconButton(
                                icon: const Icon(Icons.delete_outline, color: food_color_red),
                                onPressed: () => _removeFavorite(id),
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
