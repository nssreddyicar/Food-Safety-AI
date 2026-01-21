/// =============================================================================
/// FILE: android-app/lib/config/env.dart
/// PURPOSE: Environment configuration for API endpoints
/// =============================================================================
/// 
/// Manages environment-specific configuration:
/// - Development: Local/staging API
/// - Production: Live API server
/// 
/// RULES:
/// - Never hardcode production URLs in code
/// - Use environment variables or build-time config
/// =============================================================================

import 'package:flutter/foundation.dart';

/// Environment types.
enum Environment {
  development,
  production,
}

/// Environment configuration singleton.
class Env {
  static late Environment _current;
  static late String _apiBaseUrl;
  
  /// Initialize environment based on build mode.
  static Future<void> initialize() async {
    if (kReleaseMode) {
      _current = Environment.production;
      _apiBaseUrl = const String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'https://api.foodsafety.gov.in',
      );
    } else {
      _current = Environment.development;
      _apiBaseUrl = const String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'http://localhost:5000',
      );
    }
  }
  
  /// Current environment.
  static Environment get current => _current;
  
  /// API base URL for current environment.
  static String get apiBaseUrl => _apiBaseUrl;
  
  /// Whether running in development mode.
  static bool get isDevelopment => _current == Environment.development;
  
  /// Whether running in production mode.
  static bool get isProduction => _current == Environment.production;
}
