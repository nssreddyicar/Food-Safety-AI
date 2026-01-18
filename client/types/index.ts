export type InspectionStatus = 'draft' | 'submitted' | 'under_review' | 'closed';

export type SampleResult = 'pending' | 'not_unsafe' | 'substandard' | 'unsafe';

export type SampleType = 'enforcement' | 'surveillance';

export type PackingType = 'packed' | 'loose';

export interface JurisdictionInfo {
  assignmentId?: string;
  unitId?: string;
  unitName?: string;
  roleName?: string;
  capacityName?: string;
  isPrimary?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'fso' | 'do' | 'commissioner' | 'super_admin';
  designation: string;
  district?: string;
  phone?: string;
  employeeId?: string;
  jurisdiction?: JurisdictionInfo | null;
  allJurisdictions?: JurisdictionInfo[];
  avatar?: string;
}

export interface FBODetails {
  establishmentName: string;
  name: string;
  sonOfName?: string;
  age?: number;
  address: string;
  licenseNumber?: string;
  registrationNumber?: string;
  hasLicense: boolean;
}

export interface ProprietorDetails {
  name: string;
  sonOfName?: string;
  age?: number;
  address: string;
  phone: string;
  aadhaarNumber?: string;
  isSameAsFBO: boolean;
}

export interface Deviation {
  id: string;
  category: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
}

export interface Witness {
  id: string;
  name: string;
  sonOfName?: string;
  age?: number;
  address: string;
  phone: string;
  aadhaarNumber?: string;
  aadhaarImage?: string;
  signature?: string;
}

export interface ManufacturerDetails {
  name: string;
  address: string;
  licenseNumber?: string;
}

export interface DistributorDetails {
  name: string;
  address: string;
  licenseNumber?: string;
}

export interface RepackerDetails {
  name: string;
  address: string;
  licenseNumber?: string;
}

export interface RelabellerDetails {
  name: string;
  address: string;
  licenseNumber?: string;
}

export interface Sample {
  id: string;
  inspectionId: string;
  jurisdictionId?: string;
  sampleType: SampleType;
  name: string;
  code: string;
  liftedDate: string;
  liftedPlace: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  cost: number;
  quantityInGrams: number;
  preservativeAdded: boolean;
  preservativeType?: string;
  packingType: PackingType;
  manufacturerDetails?: ManufacturerDetails;
  distributorDetails?: DistributorDetails;
  repackerDetails?: RepackerDetails;
  relabellerDetails?: RelabellerDetails;
  mfgDate?: string;
  useByDate?: string;
  lotBatchNumber?: string;
  dispatchDate?: string;
  dispatchMode?: 'post' | 'courier' | 'by_hand';
  acknowledgementImage?: string;
  labReportDate?: string;
  labResult?: SampleResult;
  remarks?: string;
  daysRemaining?: number;
}

export interface ActionTaken {
  id: string;
  actionType: string;
  description: string;
  images: string[];
  countdownDate?: string;
  remarks?: string;
}

export interface Inspection {
  id: string;
  type: string;
  status: InspectionStatus;
  createdAt: string;
  updatedAt: string;
  fboDetails: FBODetails;
  proprietorDetails: ProprietorDetails;
  deviations: Deviation[];
  actionsTaken: ActionTaken[];
  sampleLifted: boolean;
  samples: Sample[];
  witnesses: Witness[];
  fsoId: string;
  fsoName: string;
  district: string;
  jurisdictionId?: string;
}

export interface DashboardStats {
  pendingInspections: number;
  overdueSamples: number;
  samplesInTransit: number;
  completedThisMonth: number;
}

export interface UrgentAction {
  id: string;
  type: 'sample_deadline' | 'report_pending' | 'notice_due';
  title: string;
  description: string;
  daysRemaining: number;
  sampleId?: string;
  inspectionId?: string;
}

export const PRESERVATIVE_TYPES = [
  'Sodium Benzoate',
  'Potassium Sorbate',
  'Sodium Metabisulphite',
  'Citric Acid',
  'Acetic Acid',
  'Formalin',
  'Other'
];

export const ACTION_TYPES = [
  'Warning Issued',
  'Improvement Notice',
  'Seizure Order',
  'Prohibition Order',
  'Prosecution Initiated',
  'License Suspended',
  'License Cancelled',
  'No Issues Found'
];
