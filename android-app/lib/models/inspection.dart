/// =============================================================================
/// FILE: android-app/lib/models/inspection.dart
/// PURPOSE: Inspection data model
/// =============================================================================

class Inspection {
  final String id;
  final String jurisdictionId;
  final String officerId;
  final String type;
  final String status;
  final String? fboName;
  final String? fboAddress;
  final String? fboLicenseNumber;
  final String? findings;
  final String? deviations;
  final String? actionsTaken;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? closedAt;

  const Inspection({
    required this.id,
    required this.jurisdictionId,
    required this.officerId,
    required this.type,
    required this.status,
    this.fboName,
    this.fboAddress,
    this.fboLicenseNumber,
    this.findings,
    this.deviations,
    this.actionsTaken,
    required this.createdAt,
    required this.updatedAt,
    this.closedAt,
  });

  factory Inspection.fromJson(Map<String, dynamic> json) {
    return Inspection(
      id: json['id'],
      jurisdictionId: json['jurisdictionId'],
      officerId: json['officerId'],
      type: json['type'],
      status: json['status'],
      fboName: json['fboName'],
      fboAddress: json['fboAddress'],
      fboLicenseNumber: json['fboLicenseNumber'],
      findings: json['findings'],
      deviations: json['deviations'],
      actionsTaken: json['actionsTaken'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      closedAt: json['closedAt'] != null ? DateTime.parse(json['closedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'jurisdictionId': jurisdictionId,
      'officerId': officerId,
      'type': type,
      'status': status,
      'fboName': fboName,
      'fboAddress': fboAddress,
      'fboLicenseNumber': fboLicenseNumber,
      'findings': findings,
      'deviations': deviations,
      'actionsTaken': actionsTaken,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'closedAt': closedAt?.toIso8601String(),
    };
  }

  bool get isImmutable => status == 'closed';
  
  bool get canEdit => !isImmutable;
}
