/// =============================================================================
/// FILE: android-app/lib/screens/inspections_screen.dart
/// PURPOSE: Inspection list and management screen
/// =============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/theme.dart';
import '../widgets/stat_card.dart';

class InspectionsScreen extends ConsumerStatefulWidget {
  const InspectionsScreen({super.key});

  @override
  ConsumerState<InspectionsScreen> createState() => _InspectionsScreenState();
}

class _InspectionsScreenState extends ConsumerState<InspectionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inspections'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'In Progress'),
            Tab(text: 'Completed'),
            Tab(text: 'Follow-up'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // TODO: Show filter options
            },
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildInspectionList('all'),
          _buildInspectionList('in_progress'),
          _buildInspectionList('completed'),
          _buildInspectionList('requires_followup'),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: Navigate to new inspection
        },
        icon: const Icon(Icons.add),
        label: const Text('New Inspection'),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  Widget _buildInspectionList(String status) {
    // TODO: Fetch inspections from API based on status
    return ListView.builder(
      padding: const EdgeInsets.all(Spacing.md),
      itemCount: 5, // Placeholder count
      itemBuilder: (context, index) {
        return _InspectionCard(
          fboName: 'FBO Name ${index + 1}',
          address: '123 Street, City',
          status: status == 'all' 
              ? (index % 3 == 0 ? 'in_progress' : index % 3 == 1 ? 'completed' : 'draft')
              : status,
          date: DateTime.now().subtract(Duration(days: index)),
          onTap: () {
            // TODO: Navigate to inspection details
          },
        );
      },
    );
  }
}

class _InspectionCard extends StatelessWidget {
  final String fboName;
  final String address;
  final String status;
  final DateTime date;
  final VoidCallback onTap;

  const _InspectionCard({
    required this.fboName,
    required this.address,
    required this.status,
    required this.date,
    required this.onTap,
  });

  Color get _statusColor {
    switch (status) {
      case 'draft':
        return Colors.grey;
      case 'in_progress':
        return AppColors.primary;
      case 'completed':
        return AppColors.success;
      case 'requires_followup':
        return AppColors.warning;
      case 'closed':
        return Colors.grey.shade700;
      default:
        return AppColors.primary;
    }
  }

  String get _statusLabel {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'requires_followup':
        return 'Follow-up';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: Spacing.md),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(Spacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      fboName,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: Spacing.sm,
                      vertical: Spacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: _statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _statusLabel,
                      style: TextStyle(
                        color: _statusColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Spacing.sm),
              Row(
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: Spacing.xs),
                  Expanded(
                    child: Text(
                      address,
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Spacing.xs),
              Row(
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: Spacing.xs),
                  Text(
                    '${date.day}/${date.month}/${date.year}',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
