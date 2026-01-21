/// =============================================================================
/// FILE: android-app/lib/models/sample.dart
/// PURPOSE: Sample data model
/// =============================================================================

class Sample {
  final String id;
  final String code;
  final String jurisdictionId;
  final String officerId;
  final String? inspectionId;
  final String sampleType;
  final String status;
  final String? productName;
  final String? productBrand;
  final String? batchNumber;
  final DateTime? manufacturingDate;
  final DateTime? expiryDate;
  final String? quantity;
  final DateTime? liftedDate;
  final DateTime? dispatchDate;
  final String? labName;
  final String labResult;
  final DateTime? labReportDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Sample({
    required this.id,
    required this.code,
    required this.jurisdictionId,
    required this.officerId,
    this.inspectionId,
    required this.sampleType,
    required this.status,
    this.productName,
    this.productBrand,
    this.batchNumber,
    this.manufacturingDate,
    this.expiryDate,
    this.quantity,
    this.liftedDate,
    this.dispatchDate,
    this.labName,
    required this.labResult,
    this.labReportDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Sample.fromJson(Map<String, dynamic> json) {
    return Sample(
      id: json['id'],
      code: json['code'],
      jurisdictionId: json['jurisdictionId'],
      officerId: json['officerId'],
      inspectionId: json['inspectionId'],
      sampleType: json['sampleType'],
      status: json['status'],
      productName: json['productName'],
      productBrand: json['productBrand'],
      batchNumber: json['batchNumber'],
      manufacturingDate: json['manufacturingDate'] != null 
          ? DateTime.parse(json['manufacturingDate']) 
          : null,
      expiryDate: json['expiryDate'] != null 
          ? DateTime.parse(json['expiryDate']) 
          : null,
      quantity: json['quantity'],
      liftedDate: json['liftedDate'] != null 
          ? DateTime.parse(json['liftedDate']) 
          : null,
      dispatchDate: json['dispatchDate'] != null 
          ? DateTime.parse(json['dispatchDate']) 
          : null,
      labName: json['labName'],
      labResult: json['labResult'] ?? 'pending',
      labReportDate: json['labReportDate'] != null 
          ? DateTime.parse(json['labReportDate']) 
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'jurisdictionId': jurisdictionId,
      'officerId': officerId,
      'inspectionId': inspectionId,
      'sampleType': sampleType,
      'status': status,
      'productName': productName,
      'productBrand': productBrand,
      'batchNumber': batchNumber,
      'manufacturingDate': manufacturingDate?.toIso8601String(),
      'expiryDate': expiryDate?.toIso8601String(),
      'quantity': quantity,
      'liftedDate': liftedDate?.toIso8601String(),
      'dispatchDate': dispatchDate?.toIso8601String(),
      'labName': labName,
      'labResult': labResult,
      'labReportDate': labReportDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  static const _immutableStatuses = ['dispatched', 'at_lab', 'result_received', 'processed'];
  
  bool get isImmutable => _immutableStatuses.contains(status);
  
  bool get canEdit => !isImmutable;

  int? get daysUntilDeadline {
    if (dispatchDate == null) return null;
    final deadline = dispatchDate!.add(const Duration(days: 14));
    return deadline.difference(DateTime.now()).inDays;
  }

  bool get isOverdue {
    final days = daysUntilDeadline;
    return days != null && days < 0;
  }
}
