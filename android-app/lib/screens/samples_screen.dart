/// =============================================================================
/// FILE: android-app/lib/screens/samples_screen.dart
/// PURPOSE: Sample tracking and management screen
/// =============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/theme.dart';

class SamplesScreen extends ConsumerStatefulWidget {
  const SamplesScreen({super.key});

  @override
  ConsumerState<SamplesScreen> createState() => _SamplesScreenState();
}

class _SamplesScreenState extends ConsumerState<SamplesScreen>
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
        title: const Text('Samples'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Pending'),
            Tab(text: 'At Lab'),
            Tab(text: 'Results'),
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
          _buildSampleList(null),
          _buildSampleList('pending'),
          _buildSampleList('at_lab'),
          _buildSampleList('result_received'),
        ],
      ),
    );
  }

  Widget _buildSampleList(String? status) {
    // TODO: Fetch samples from API based on status
    return ListView.builder(
      padding: const EdgeInsets.all(Spacing.md),
      itemCount: 5,
      itemBuilder: (context, index) {
        final daysRemaining = 14 - index * 3;
        return _SampleCard(
          code: 'FSO-2024-${1000 + index}',
          productName: 'Product ${index + 1}',
          sampleType: index % 2 == 0 ? 'enforcement' : 'surveillance',
          status: status ?? (index % 3 == 0 ? 'at_lab' : index % 3 == 1 ? 'dispatched' : 'collected'),
          daysRemaining: daysRemaining,
          onTap: () {
            // TODO: Navigate to sample details
          },
        );
      },
    );
  }
}

class _SampleCard extends StatelessWidget {
  final String code;
  final String productName;
  final String sampleType;
  final String status;
  final int daysRemaining;
  final VoidCallback onTap;

  const _SampleCard({
    required this.code,
    required this.productName,
    required this.sampleType,
    required this.status,
    required this.daysRemaining,
    required this.onTap,
  });

  Color get _urgencyColor {
    if (daysRemaining < 0) return AppColors.urgent;
    if (daysRemaining <= 3) return AppColors.urgent;
    if (daysRemaining <= 7) return AppColors.warning;
    return AppColors.success;
  }

  String get _statusLabel {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'collected':
        return 'Collected';
      case 'dispatched':
        return 'Dispatched';
      case 'at_lab':
        return 'At Lab';
      case 'result_received':
        return 'Result Received';
      case 'processed':
        return 'Processed';
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
                  Container(
                    width: 4,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _urgencyColor,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: Spacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          code,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(height: Spacing.xs),
                        Text(
                          productName,
                          style: TextStyle(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: Spacing.sm,
                          vertical: Spacing.xs,
                        ),
                        decoration: BoxDecoration(
                          color: sampleType == 'enforcement'
                              ? AppColors.urgent.withOpacity(0.1)
                              : AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          sampleType == 'enforcement' ? 'ENF' : 'SUR',
                          style: TextStyle(
                            color: sampleType == 'enforcement'
                                ? AppColors.urgent
                                : AppColors.primary,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: Spacing.xs),
                      Text(
                        _statusLabel,
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              if (status == 'at_lab' || status == 'dispatched') ...[
                const SizedBox(height: Spacing.md),
                Container(
                  padding: const EdgeInsets.all(Spacing.sm),
                  decoration: BoxDecoration(
                    color: _urgencyColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.timer_outlined,
                        size: 16,
                        color: _urgencyColor,
                      ),
                      const SizedBox(width: Spacing.sm),
                      Text(
                        daysRemaining < 0
                            ? 'Overdue by ${-daysRemaining} days'
                            : '$daysRemaining days until deadline',
                        style: TextStyle(
                          color: _urgencyColor,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
