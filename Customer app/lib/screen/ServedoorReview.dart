import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:nb_utils/nb_utils.dart';

class FoodReview extends StatefulWidget {
  static String tag = '/FoodReview';
  final String restaurantId;

  const FoodReview({super.key, required this.restaurantId});

  @override
  FoodReviewState createState() => FoodReviewState();
}

class FoodReviewState extends State<FoodReview> {
  List<Map<String, dynamic>> _reviews = [];
  double _average = 0;
  int _count = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    setState(() => _loading = true);
    try {
      final data = await ServedoorApi.getRestaurantReviews(widget.restaurantId, page: 1, limit: 50);
      final list = (data['reviews'] as List? ?? const [])
          .whereType<Map>()
          .map((e) => e.cast<String, dynamic>())
          .toList();
      if (!mounted) return;
      setState(() {
        _reviews = list;
        _average = ((data['averageRating'] as num?) ?? 0).toDouble();
        _count = (data['count'] as num?)?.toInt() ?? list.length;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      toast('Unable to load reviews: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    changeStatusColor(food_white);
    return Scaffold(
      backgroundColor: food_white,
      appBar: appBar(context, food_lbl_reviews),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadReviews,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: ListTile(
                      title: Text('Average Rating', style: boldTextStyle()),
                      subtitle: Text('$_count reviews'),
                      trailing: Text('${_average.toStringAsFixed(1)} ⭐', style: boldTextStyle(color: food_colorPrimary)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (_reviews.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(top: 40),
                      child: Center(child: Text('No reviews yet')),
                    ),
                  ..._reviews.map((review) {
                    final rating = ((review['rating'] as num?) ?? 0).toDouble();
                    final reviewText = (review['review'] ?? '').toString();
                    final userName = (review['userName'] ?? 'Servedoor User').toString();
                    final ratedAt = DateTime.tryParse((review['ratedAt'] ?? '').toString());
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(child: Text(userName, style: boldTextStyle())),
                                Text('${rating.toStringAsFixed(1)} ⭐', style: boldTextStyle(color: food_colorPrimary)),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(reviewText.isEmpty ? 'No written review' : reviewText),
                            if (ratedAt != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 6),
                                child: Text(DateFormat('dd MMM yyyy').format(ratedAt), style: secondaryTextStyle()),
                              ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}
