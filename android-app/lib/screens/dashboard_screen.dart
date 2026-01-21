/// =============================================================================
/// FILE: android-app/lib/screens/dashboard_screen.dart
/// PURPOSE: Main dashboard for Food Safety Officers
/// =============================================================================
/// 
/// Displays:
/// - Key metrics (pending inspections, samples, cases)
/// - Urgent actions requiring attention
/// - Quick access navigation
/// 
/// RULES:
/// - All data comes from backend API
/// - No business logic calculations here
/// =============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/theme.dart';
import '../widgets/stat_card.dart';
import '../widgets/urgent_action_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: Navigate to notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {
              // TODO: Navigate to profile
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // TODO: Refresh dashboard data
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(Spacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting
              Text(
                'Good Morning, Officer',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: Spacing.xs),
              Text(
                'Here\'s your daily overview',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: Spacing.lg),

              // Stats grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: Spacing.md,
                crossAxisSpacing: Spacing.md,
                childAspectRatio: 1.5,
                children: const [
                  StatCard(
                    title: 'Pending Inspections',
                    value: '12',
                    icon: Icons.assignment_outlined,
                    color: AppColors.primary,
                  ),
                  StatCard(
                    title: 'Samples in Lab',
                    value: '8',
                    icon: Icons.science_outlined,
                    color: AppColors.warning,
                  ),
                  StatCard(
                    title: 'Court Cases',
                    value: '3',
                    icon: Icons.gavel_outlined,
                    color: AppColors.urgent,
                  ),
                  StatCard(
                    title: 'Completed Today',
                    value: '5',
                    icon: Icons.check_circle_outline,
                    color: AppColors.success,
                  ),
                ],
              ),
              const SizedBox(height: Spacing.lg),

              // Urgent actions
              Text(
                'Urgent Actions',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: Spacing.md),
              
              const UrgentActionCard(
                title: 'Lab Report Overdue',
                description: 'Sample #FSO-2024-0089 - 2 days overdue',
                icon: Icons.warning_amber_rounded,
                urgencyLevel: UrgencyLevel.critical,
              ),
              const SizedBox(height: Spacing.sm),
              const UrgentActionCard(
                title: 'Court Hearing Tomorrow',
                description: 'Case #FSSAI/2024/MUM/0023',
                icon: Icons.gavel,
                urgencyLevel: UrgencyLevel.high,
              ),
              const SizedBox(height: Spacing.sm),
              const UrgentActionCard(
                title: 'Inspection Due',
                description: 'Hotel Grand Plaza - Scheduled for today',
                icon: Icons.assignment_late_outlined,
                urgencyLevel: UrgencyLevel.medium,
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: 0,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Inspections',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.science_outlined),
            activeIcon: Icon(Icons.science),
            label: 'Samples',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_scanner_outlined),
            activeIcon: Icon(Icons.qr_code_scanner),
            label: 'Scanner',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.gavel_outlined),
            activeIcon: Icon(Icons.gavel),
            label: 'Cases',
          ),
        ],
      ),
    );
  }
}
