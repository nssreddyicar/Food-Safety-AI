/// =============================================================================
/// FILE: android-app/lib/services/api_client.dart
/// PURPOSE: HTTP client for backend API communication
/// =============================================================================
/// 
/// Provides type-safe API calls to the backend server.
/// Handles authentication tokens, error responses, and retries.
/// 
/// RULES:
/// - All API calls go through this client
/// - Tokens are stored securely
/// - Network errors are handled gracefully
/// =============================================================================

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/env.dart';

/// API client singleton for backend communication.
class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  
  late final Dio _dio;
  final _storage = const FlutterSecureStorage();
  
  static const String _tokenKey = 'auth_token';

  ApiClient._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    // Add interceptors
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: _tokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired - clear and redirect to login
          await _storage.delete(key: _tokenKey);
          // TODO: Navigate to login
        }
        return handler.next(error);
      },
    ));
  }

  /// Store authentication token.
  Future<void> setToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  /// Clear authentication token.
  Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
  }

  /// Check if user is authenticated.
  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: _tokenKey);
    return token != null;
  }

  /// GET request.
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.get<T>(path, queryParameters: queryParameters);
  }

  /// POST request.
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.post<T>(path, data: data, queryParameters: queryParameters);
  }

  /// PUT request.
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.put<T>(path, data: data, queryParameters: queryParameters);
  }

  /// DELETE request.
  Future<Response<T>> delete<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.delete<T>(path, queryParameters: queryParameters);
  }

  /// Upload file.
  Future<Response<T>> uploadFile<T>(
    String path,
    String filePath,
    String fieldName,
  ) async {
    final formData = FormData.fromMap({
      fieldName: await MultipartFile.fromFile(filePath),
    });
    return _dio.post<T>(path, data: formData);
  }
}
