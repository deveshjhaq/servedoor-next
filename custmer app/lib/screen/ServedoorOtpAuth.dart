import 'package:flutter/material.dart';
import 'package:nb_utils/nb_utils.dart';

import '../services/servedoor_api.dart';
import '../utils/ServedoorColors.dart';
import '../utils/ServedoorString.dart';
import 'ServedoorDashboard.dart';

class ServedoorOtpAuth extends StatefulWidget {
  const ServedoorOtpAuth({super.key});

  @override
  State<ServedoorOtpAuth> createState() => _ServedoorOtpAuthState();
}

class _ServedoorOtpAuthState extends State<ServedoorOtpAuth> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  bool _sending = false;
  bool _verifying = false;
  bool _otpSent = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 10) {
      toast('Enter valid mobile number');
      return;
    }

    setState(() => _sending = true);
    try {
      await ServedoorApi.sendOtp(phone);
      if (!mounted) return;
      setState(() => _otpSent = true);
      toast('OTP sent successfully');
    } catch (e) {
      toast('Failed to send OTP: $e');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _verifyOtp() async {
    final phone = _phoneController.text.trim();
    final otp = _otpController.text.trim();

    if (phone.length < 10 || otp.length < 4) {
      toast('Enter valid phone and OTP');
      return;
    }

    setState(() => _verifying = true);
    try {
      await ServedoorApi.verifyOtp(phone: phone, otp: otp);
      if (!mounted) return;
      const FoodDashboard().launch(context, isNewTask: true);
    } catch (e) {
      toast('OTP verification failed: $e');
    } finally {
      if (mounted) setState(() => _verifying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Servedoor Login'),
        backgroundColor: food_colorPrimary,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            12.height,
            Text(food_lbl_continue_with_email_mobile, style: boldTextStyle(size: 18)),
            16.height,
            AppTextField(
              controller: _phoneController,
              textFieldType: TextFieldType.PHONE,
              decoration: const InputDecoration(
                labelText: food_hint_mobile_no,
                border: OutlineInputBorder(),
              ),
            ),
            12.height,
            ElevatedButton(
              onPressed: _sending ? null : _sendOtp,
              child: Text(_sending ? 'Sending...' : 'Send OTP'),
            ),
            16.height,
            if (_otpSent) ...[
              AppTextField(
                controller: _otpController,
                textFieldType: TextFieldType.NUMBER,
                decoration: const InputDecoration(
                  labelText: 'OTP',
                  border: OutlineInputBorder(),
                ),
              ),
              12.height,
              ElevatedButton(
                onPressed: _verifying ? null : _verifyOtp,
                child: Text(_verifying ? 'Verifying...' : 'Verify OTP'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}


