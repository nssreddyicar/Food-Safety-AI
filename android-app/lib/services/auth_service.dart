/// =============================================================================
/// FILE: android-app/lib/services/auth_service.dart
/// PURPOSE: Authentication service for officer login/logout
/// =============================================================================

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client.dart';
import '../models/officer.dart';

/// Authentication state.
class AuthState {
  final bool isAuthenticated;
  final Officer? officer;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.officer,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    Officer? officer,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      officer: officer ?? this.officer,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Authentication service provider.
final authServiceProvider = StateNotifierProvider<AuthService, AuthState>(
  (ref) => AuthService(),
);

/// Authentication service.
class AuthService extends StateNotifier<AuthState> {
  final _apiClient = ApiClient();

  AuthService() : super(const AuthState());

  /// Login with email and password.
  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/api/officer/login',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data!;
        
        // Store token
        if (data['token'] != null) {
          await _apiClient.setToken(data['token']);
        }

        // Parse officer
        final officer = Officer.fromJson(data['officer']);
        
        state = state.copyWith(
          isAuthenticated: true,
          officer: officer,
          isLoading: false,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Invalid credentials',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Login failed. Please try again.',
      );
    }
  }

  /// Logout and clear session.
  Future<void> logout() async {
    await _apiClient.clearToken();
    state = const AuthState();
  }

  /// Check if user is authenticated.
  Future<void> checkAuth() async {
    final isAuth = await _apiClient.isAuthenticated();
    if (!isAuth) {
      state = const AuthState();
      return;
    }

    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/api/officer/me',
      );

      if (response.statusCode == 200 && response.data != null) {
        final officer = Officer.fromJson(response.data!);
        state = state.copyWith(
          isAuthenticated: true,
          officer: officer,
        );
      } else {
        await logout();
      }
    } catch (e) {
      await logout();
    }
  }
}
