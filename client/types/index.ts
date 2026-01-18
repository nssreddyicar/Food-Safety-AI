export type InspectionStatus = 'draft' | 'submitted' | 'under_review' | 'closed';

export type SampleResult = 'pending' | 'not_unsafe' | 'substandard' | 'unsafe';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'fso' | 'do' | 'commissioner' | 'super_admin';
  designation: string;
  district: string;
  avatar?: string;
}

export interface FBODetails {
  name: string;
  address: string;
  licenseNumber?: string;
  registrationNumber?: string;
  hasLicense: boolean;
}

export interface ProprietorDetails {
  name: string;
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
  address: string;
  phone: string;
  aadhaarImage?: string;
}

export interface Sample {
  id: string;
  inspectionId: string;
  name: string;
  code: string;
  liftedDate: string;
  liftedPlace: string;
  dispatchDate?: string;
  dispatchMode?: 'post' | 'courier' | 'by_hand';
  acknowledgementImage?: string;
  labReportDate?: string;
  labResult?: SampleResult;
  remarks?: string;
  daysRemaining?: number;
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
  actionsTaken: string[];
  sampleLifted: boolean;
  samples: Sample[];
  witnesses: Witness[];
  fsoId: string;
  fsoName: string;
  district: string;
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
