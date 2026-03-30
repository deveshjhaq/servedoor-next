import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import '../models/httpexception.dart';

class Auth with ChangeNotifier {
  static const String _apiAuthority = '10.0.2.2:8001';

  String? authToken;
  String? _userId;
  bool isNewusertoken = false;

  String? get getauthToken => authToken;
  String? get userId => _userId;
  bool get isAuth => authToken != null && authToken!.isNotEmpty;
  bool get isNewuser => isNewusertoken;

  Future<bool> login(String phoneNumber, String password) async {
    try {
      final url = Uri.http(_apiAuthority, 'api/rider/login');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'mobile': phoneNumber, 'password': password}),
      );

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('Invalid credentials');
      }

      final body = json.decode(response.body) as Map<String, dynamic>;
      final data = (body['data'] as Map<String, dynamic>?) ?? {};
      final token = (data['token'] ?? '').toString();
      if (token.isEmpty) {
        throw HttpException('Token not found in response');
      }

      authToken = token;
      _userId = (data['mobile'] ?? phoneNumber).toString();
      isNewusertoken = data['isNewUser'] == true;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setString('userId', _userId ?? '');
      await prefs.setBool('isNewUser', isNewusertoken);

      notifyListeners();
      return true;
    } catch (error) {
      throw error;
    }
  }

  Future<void> submitPassword(String password) async {
    if (!isAuth) return;
    try {
      final url = Uri.http(_apiAuthority, 'api/rider/change-password');
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $authToken',
          'Content-Type': 'application/json',
        },
        body: json.encode({'password': password}),
      );

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('Password change failed');
      }

      isNewusertoken = false;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isNewUser', false);
      notifyListeners();
    } catch (error) {
      throw error;
    }
  }

  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    try {
      if (!prefs.containsKey('token')) {
        return false;
      }

      final token = prefs.getString('token');
      if (token == null || token.isEmpty) {
        return false;
      }

      authToken = token;
      _userId = prefs.getString('userId');
      isNewusertoken = prefs.getBool('isNewUser') ?? false;
      notifyListeners();
      return true;
    } catch (error) {
      throw HttpException('could not authenticate');
    }
  }

  Future<void> logout() async {
    authToken = null;
    _userId = null;
    isNewusertoken = false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userId');
    await prefs.remove('isNewUser');
    notifyListeners();
  }
}
