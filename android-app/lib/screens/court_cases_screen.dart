/// =============================================================================
/// FILE: android-app/lib/screens/court_cases_screen.dart
/// PURPOSE: Prosecution case management screen
/// =============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/theme.dart';

class CourtCasesScreen extends ConsumerWidget {
  const CourtCasesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Court Cases'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Show search
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // TODO: Show filter options
            },
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(Spacing.md),
        itemCount: 5,
        itemBuilder: (context, index) {
          final daysUntilHearing = [2, -1, 7, 14, 30][index];
          return _CaseCard(
            caseNumber: 'FSSAI/2024/MUM/${1000 + index}',
            fboName: 'FBO ${index + 1} Enterprises',
            status: index == 0 ? 'hearing_scheduled' : index == 1 ? 'pending' : 'in_progress',
            nextHearingDate: DateTime.now().add(Duration(days: daysUntilHearing)),
            onTap: () {
              // TODO: Navigate to case details
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: Navigate to new case
        },
        icon: const Icon(Icons.add),
        label: const Text('New Case'),
        backgroundColor: AppColors.primary,
      ),
    );
  }
}

class _CaseCard extends StatelessWidget {
  final String caseNumber;
  final String fboName;
  final String status;
  final DateTime nextHearingDate;
  final VoidCallback onTap;

  const _CaseCard({
    required this.caseNumber,
    required this.fboName,
    required this.status,
    required this.nextHearingDate,
    required this.onTap,
  });

  Color get _urgencyColor {
    final daysUntil = nextHearingDate.difference(DateTime.now()).inDays;
    if (daysUntil < 0) return AppColors.urgent;
    if (daysUntil <= 3) return AppColors.urgent;
    if (daysUntil <= 7) return AppColors.warning;
    return AppColors.success;
  }

  String get _statusLabel {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'hearing_scheduled':
        return 'Hearing Scheduled';
      case 'in_progress':
        return 'In Progress';
      case 'disposed':
        return 'Disposed';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final daysUntil = nextHearingDate.difference(DateTime.now()).inDays;
    
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
                  Icon(Icons.gavel, color: AppColors.primary),
                  const SizedBox(width: Spacing.sm),
                  Expanded(
                    child: Text(
                      caseNumber,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: Spacing.sm,
                      vertical: Spacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: _urgencyColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _statusLabel,
                      style: TextStyle(
                        color: _urgencyColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Spacing.sm),
              Text(
                fboName,
                style: TextStyle(
                  color: AppColors.textSecondary,
                ),
              ),
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
                      Icons.event,
                      size: 16,
                      color: _urgencyColor,
                    ),
                    const SizedBox(width: Spacing.sm),
                    Expanded(
                      child: Text(
                        daysUntil < 0
                            ? 'Hearing was ${-daysUntil} days ago'
                            : daysUntil == 0
                                ? 'Hearing TODAY'
                                : 'Hearing in $daysUntil days',
                        style: TextStyle(
                          color: _urgencyColor,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    Text(
                      '${nextHearingDate.day}/${nextHearingDate.month}/${nextHearingDate.year}',
                      style: TextStyle(
                        color: _urgencyColor,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
