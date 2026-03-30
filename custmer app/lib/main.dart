import 'package:flutter/material.dart';
import 'package:servedoor_customer_app/screen/ServedoorSplashScreen.dart';

// Entry point of the Flutter application.
void main() {
  runApp(const MyApp());
}

// `MyApp` is a stateless widget that builds the main application.
class MyApp extends StatelessWidget {
  // Constructor for `MyApp`.
  // Accepts an optional `Key` as a parameter.
  const MyApp({Key? key}) : super(key: key);

  // Describes the part of the user interface represented by this widget.
  @override
  Widget build(BuildContext context) {
    // Returns a `MaterialApp` widget.
    return MaterialApp(
      // Disables the debug banner.
      debugShowCheckedModeBanner: false,
      // Sets the title of the application.
      title: 'Servedoor',
      // Defines the color scheme of the application.
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      // Sets the home screen of the application.
      home: const SplashScreen(),
    );
  }
}

