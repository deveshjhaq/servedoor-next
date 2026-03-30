import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/services/servedoor_api.dart';
import 'package:servedoor_customer_app/utils/AppWidget.dart';
import 'package:servedoor_customer_app/utils/ServedoorColors.dart';
import 'package:servedoor_customer_app/utils/ServedoorString.dart';
import 'package:nb_utils/nb_utils.dart';

class FoodProfile extends StatefulWidget {
  static String tag = '/FoodProfile';

  const FoodProfile({super.key});

  @override
  FoodProfileState createState() => FoodProfileState();
}

class FoodProfileState extends State<FoodProfile> {
  bool _isLoading = true;
  bool _isSaving = false;
  String _error = '';

  Map<String, dynamic> _profile = <String, dynamic>{};
  List<dynamic> _addresses = <dynamic>[];

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final profile = await ServedoorApi.getProfile();
      final addresses = await ServedoorApi.getAddresses();
      if (!mounted) return;

      _nameController.text = (profile['name'] ?? '').toString();
      _emailController.text = (profile['email'] ?? '').toString();

      setState(() {
        _profile = profile;
        _addresses = addresses;
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

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    try {
      final updated = await ServedoorApi.updateProfile(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
      );
      if (!mounted) return;
      setState(() => _profile = updated);
      toast('Profile updated successfully');
    } catch (e) {
      toast('Failed to update profile: $e');
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: food_white,
      appBar: appBar(context, food_lbl_profile),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Failed to load profile', style: primaryTextStyle(color: food_color_red)),
                      10.height,
                      ElevatedButton(onPressed: _loadProfile, child: const Text('Retry')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadProfile,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Text('Servedoor Account', style: boldTextStyle(size: 18)),
                      12.height,
                      AppTextField(
                        controller: _nameController,
                        textFieldType: TextFieldType.NAME,
                        decoration: const InputDecoration(
                          labelText: 'Name',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      12.height,
                      AppTextField(
                        controller: _emailController,
                        textFieldType: TextFieldType.EMAIL,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      12.height,
                      Text(
                        'Phone: ${( _profile['phone'] ?? '-' ).toString()}',
                        style: primaryTextStyle(color: food_textColorSecondary),
                      ),
                      12.height,
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSaving ? null : _saveProfile,
                          style: ElevatedButton.styleFrom(backgroundColor: food_colorPrimary),
                          child: Text(_isSaving ? 'Saving...' : food_lbl_save_profile),
                        ),
                      ),
                      20.height,
                      Text('Saved Addresses', style: boldTextStyle(size: 16)),
                      8.height,
                      if (_addresses.isEmpty)
                        Text('No saved addresses', style: primaryTextStyle(color: food_textColorSecondary)),
                      if (_addresses.isNotEmpty)
                        ..._addresses.map((a) {
                          final addr = (a as Map).cast<String, dynamic>();
                          final isDefault = addr['isDefault'] == true;
                          final addressLine = [
                            addr['address'],
                            addr['area'],
                            addr['city'],
                            addr['state'],
                            addr['pincode']
                          ].where((x) => x != null && x.toString().trim().isNotEmpty).join(', ');

                          return Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            child: ListTile(
                              title: Text(
                                (addr['type'] ?? 'Address').toString(),
                                style: boldTextStyle(),
                              ),
                              subtitle: Text(addressLine.isEmpty ? '-' : addressLine),
                              trailing: isDefault
                                  ? const Chip(label: Text('Default'))
                                  : null,
                            ),
                          );
                        }),
                    ],
                  ),
                ),
    );
  }
}


