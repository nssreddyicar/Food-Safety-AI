import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Inspection, Sample, DashboardStats, UrgentAction } from '@/types';

const KEYS = {
  USER: '@foodsafety_user',
  INSPECTIONS: '@foodsafety_inspections',
  SAMPLES: '@foodsafety_samples',
};

export const storage = {
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async getInspections(): Promise<Inspection[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.INSPECTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setInspections(inspections: Inspection[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.INSPECTIONS, JSON.stringify(inspections));
  },

  async addInspection(inspection: Inspection): Promise<void> {
    const inspections = await this.getInspections();
    inspections.unshift(inspection);
    await this.setInspections(inspections);
  },

  async updateInspection(updatedInspection: Inspection): Promise<void> {
    const inspections = await this.getInspections();
    const index = inspections.findIndex(i => i.id === updatedInspection.id);
    if (index !== -1) {
      inspections[index] = updatedInspection;
      await this.setInspections(inspections);
    }
  },

  async getSamples(): Promise<Sample[]> {
    const inspections = await this.getInspections();
    const samples: Sample[] = [];
    inspections.forEach(inspection => {
      inspection.samples.forEach(sample => {
        const daysRemaining = sample.dispatchDate
          ? Math.max(0, 14 - Math.floor((Date.now() - new Date(sample.dispatchDate).getTime()) / (1000 * 60 * 60 * 24)))
          : undefined;
        samples.push({ ...sample, daysRemaining });
      });
    });
    return samples.sort((a, b) => {
      if (a.daysRemaining !== undefined && b.daysRemaining !== undefined) {
        return a.daysRemaining - b.daysRemaining;
      }
      return new Date(b.liftedDate).getTime() - new Date(a.liftedDate).getTime();
    });
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const inspections = await this.getInspections();
    const samples = await this.getSamples();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      pendingInspections: inspections.filter(i => i.status === 'draft' || i.status === 'submitted').length,
      overdueSamples: samples.filter(s => s.daysRemaining !== undefined && s.daysRemaining <= 0 && !s.labResult).length,
      samplesInTransit: samples.filter(s => s.dispatchDate && !s.labResult).length,
      completedThisMonth: inspections.filter(i => i.status === 'closed' && new Date(i.updatedAt) >= startOfMonth).length,
    };
  },

  async getUrgentActions(): Promise<UrgentAction[]> {
    const samples = await this.getSamples();
    const urgentActions: UrgentAction[] = [];

    samples.forEach(sample => {
      if (sample.dispatchDate && !sample.labResult && sample.daysRemaining !== undefined) {
        urgentActions.push({
          id: `urgent_${sample.id}`,
          type: 'sample_deadline',
          title: `Lab Report Due: ${sample.name}`,
          description: `Sample ${sample.code} - ${sample.daysRemaining <= 0 ? 'OVERDUE' : `${sample.daysRemaining} days remaining`}`,
          daysRemaining: sample.daysRemaining,
          sampleId: sample.id,
          inspectionId: sample.inspectionId,
        });
      }
    });

    return urgentActions.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.USER, KEYS.INSPECTIONS, KEYS.SAMPLES]);
  },

  async seedDemoData(): Promise<void> {
    const demoUser: User = {
      id: 'fso_001',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@fssai.gov.in',
      role: 'fso',
      designation: 'Food Safety Officer',
      district: 'Mumbai Central',
    };

    const demoInspections: Inspection[] = [
      {
        id: 'insp_001',
        type: 'Routine',
        status: 'submitted',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        fboDetails: {
          establishmentName: 'Fresh Foods Restaurant',
          name: 'Amit Shah',
          sonOfName: 'Ramesh Shah',
          age: 45,
          address: '123 MG Road, Mumbai',
          licenseNumber: 'FSSAI123456789',
          hasLicense: true,
        },
        proprietorDetails: {
          name: 'Amit Shah',
          sonOfName: 'Ramesh Shah',
          age: 45,
          address: '456 Park Street, Mumbai',
          phone: '9876543210',
          isSameAsFBO: false,
        },
        deviations: [
          { id: 'dev_001', category: 'Hygiene', description: 'Inadequate hand washing facilities', severity: 'major' },
        ],
        actionsTaken: [
          { id: 'action_001', actionType: 'Warning Issued', description: 'Verbal warning given to improve hygiene conditions', images: [] },
          { id: 'action_002', actionType: 'Improvement Notice', description: 'Written notice issued with 7 days compliance period', images: [], countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        sampleLifted: true,
        samples: [
          {
            id: 'sample_001',
            inspectionId: 'insp_001',
            sampleType: 'enforcement',
            name: 'Cooking Oil Sample',
            code: 'MUM-2024-001',
            liftedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            liftedPlace: 'Kitchen Area',
            officerId: 'fso_001',
            officerName: 'Rajesh Kumar',
            officerDesignation: 'Food Safety Officer',
            cost: 250,
            quantityInGrams: 500,
            preservativeAdded: true,
            preservativeType: 'Citric Acid',
            packingType: 'packed',
            manufacturerDetails: { name: 'Fortune Foods Ltd', address: 'Industrial Area, Delhi', licenseNumber: 'FSSAI-MFG-12345' },
            mfgDate: '15/10/2024',
            useByDate: '15/10/2025',
            lotBatchNumber: 'LOT2024-789',
            dispatchDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            dispatchMode: 'courier',
          },
        ],
        witnesses: [
          { id: 'wit_001', name: 'Suresh Patel', address: 'Near Restaurant', phone: '9876543211' },
        ],
        fsoId: 'fso_001',
        fsoName: 'Rajesh Kumar',
        district: 'Mumbai Central',
      },
      {
        id: 'insp_002',
        type: 'Complaint Based',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fboDetails: {
          establishmentName: 'Street Food Vendor',
          name: 'Mohammad Ali',
          sonOfName: 'Abdul Ali',
          age: 38,
          address: 'Andheri Station Road',
          hasLicense: false,
        },
        proprietorDetails: {
          name: 'Mohammad Ali',
          address: 'Andheri East',
          phone: '9876543212',
          isSameAsFBO: true,
        },
        deviations: [],
        actionsTaken: [],
        sampleLifted: false,
        samples: [],
        witnesses: [],
        fsoId: 'fso_001',
        fsoName: 'Rajesh Kumar',
        district: 'Mumbai Central',
      },
      {
        id: 'insp_003',
        type: 'Special Drive',
        status: 'closed',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        fboDetails: {
          establishmentName: 'Royal Bakery',
          name: 'Priya Sharma',
          sonOfName: 'Vikram Sharma',
          age: 35,
          address: '789 Colaba, Mumbai',
          licenseNumber: 'FSSAI987654321',
          hasLicense: true,
        },
        proprietorDetails: {
          name: 'Priya Sharma',
          sonOfName: 'Vikram Sharma',
          age: 35,
          address: '789 Colaba, Mumbai',
          phone: '9876543213',
          isSameAsFBO: true,
        },
        deviations: [],
        actionsTaken: [
          { id: 'action_003', actionType: 'No Issues Found', description: 'Premises found in compliance with all food safety standards', images: [] },
        ],
        sampleLifted: true,
        samples: [
          {
            id: 'sample_002',
            inspectionId: 'insp_003',
            sampleType: 'surveillance',
            name: 'Bread Sample',
            code: 'MUM-2024-002',
            liftedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            liftedPlace: 'Production Area',
            officerId: 'fso_001',
            officerName: 'Rajesh Kumar',
            officerDesignation: 'Food Safety Officer',
            cost: 150,
            quantityInGrams: 300,
            preservativeAdded: false,
            packingType: 'loose',
            dispatchDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
            dispatchMode: 'post',
            labReportDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            labResult: 'not_unsafe',
          },
        ],
        witnesses: [],
        fsoId: 'fso_001',
        fsoName: 'Rajesh Kumar',
        district: 'Mumbai Central',
      },
    ];

    await this.setUser(demoUser);
    await this.setInspections(demoInspections);
  },
};
