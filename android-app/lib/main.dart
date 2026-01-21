/// =============================================================================
/// FILE: android-app/lib/main.dart
/// PURPOSE: Application entry point and root configuration
/// =============================================================================
/// 
/// This file initializes the Flutter application and sets up:
/// - State management (Riverpod)
/// - Theme configuration
/// - Navigation
/// - Environment-based API configuration
/// 
/// RULES:
/// - No business logic here
/// - Only app initialization and configuration
/// =============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/login_screen.dart';
import 'config/theme.dart';
import 'config/env.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize environment configuration
  await Env.initialize();
  
  runApp(
    const ProviderScope(
      child: FoodSafetyApp(),
    ),
  );
}

/// Root application widget.
/// 
/// Configures MaterialApp with:
/// - Government-grade theme (authoritative blue)
/// - Navigation routes
/// - Error handling
class FoodSafetyApp extends StatelessWidget {
  const FoodSafetyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Food Safety Inspector',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      home: const LoginScreen(),
    );
  }
}
