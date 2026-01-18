import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { ThemedText } from '@/components/ThemedText';
import { StatusBadge } from '@/components/StatusBadge';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/context/AuthContext';
import { storage } from '@/lib/storage';
import { Sample, Inspection } from '@/types';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  contentType: 'plain_text' | 'html';
  content: string;
  pageSize: string;
  orientation: string;
  createdAt: string;
}

type RouteParams = {
  SampleDetails: { sampleId: string };
};

interface TimelineStepProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  date?: string;
  isActive: boolean;
  isComplete: boolean;
  isLast?: boolean;
}

function TimelineStep({ icon, title, date, isActive, isComplete, isLast }: TimelineStepProps) {
  const { theme } = useTheme();
  const color = isComplete ? theme.success : isActive ? theme.primary : theme.textSecondary;
  
  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineIcon, { backgroundColor: color + '20', borderColor: color }]}>
          <Feather name={isComplete ? 'check' : icon} size={16} color={color} />
        </View>
        {!isLast ? (
          <View style={[styles.timelineLine, { backgroundColor: isComplete ? theme.success : theme.border }]} />
        ) : null}
      </View>
      <View style={styles.timelineContent}>
        <ThemedText type="h4" style={{ color }}>{title}</ThemedText>
        {date ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>{date}</ThemedText>
        ) : (
          <ThemedText type="small" style={{ color: theme.textDisabled }}>Pending</ThemedText>
        )}
      </View>
    </View>
  );
}

interface SampleWithInspection extends Sample {
  establishmentName?: string;
  fboName?: string;
  fboAddress?: string;
  fboLicense?: string;
  inspectionDate?: string;
  inspectionType?: string;
}

export default function SampleDetailsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<RouteProp<RouteParams, 'SampleDetails'>>();
  const { user, activeJurisdiction } = useAuthContext();
  
  const [sample, setSample] = useState<SampleWithInspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: templates = [] } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/templates'],
  });

  useEffect(() => {
    loadSample();
  }, []);

  const loadSample = async () => {
    try {
      const inspections = await storage.getInspections(activeJurisdiction?.unitId);
      let foundSample: SampleWithInspection | null = null;
      
      for (const inspection of inspections) {
        if (inspection.samples) {
          const found = inspection.samples.find((s: Sample) => s.id === route.params.sampleId);
          if (found) {
            foundSample = {
              ...found,
              establishmentName: inspection.fboDetails?.establishmentName,
              fboName: inspection.fboDetails?.name,
              fboAddress: inspection.fboDetails?.address,
              fboLicense: inspection.fboDetails?.licenseNumber || inspection.fboDetails?.registrationNumber,
              inspectionDate: inspection.createdAt,
              inspectionType: inspection.type,
            };
            break;
          }
        }
      }
      
      if (!foundSample) {
        const samples = await storage.getSamples();
        const found = samples.find((s) => s.id === route.params.sampleId);
        if (found) {
          foundSample = found;
        }
      }
      
      setSample(foundSample);
    } catch (error) {
      console.error('Failed to load sample:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const replacePlaceholders = (content: string): string => {
    const now = new Date();
    
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '[Date]';
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    
    const placeholderValues: Record<string, string> = {
      officer_name: user?.name || '',
      officer_designation: user?.designation || 'Food Safety Officer',
      officer_email: user?.email || '',
      officer_phone: user?.phone || '',
      officer_employee_id: user?.employeeId || '',
      jurisdiction_name: user?.jurisdiction?.unitName || activeJurisdiction?.unitName || '',
      jurisdiction_type: user?.jurisdiction?.roleName || activeJurisdiction?.roleName || '',
      current_date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      current_time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      fbo_name: sample?.fboName || '[FBO Name]',
      fbo_address: sample?.fboAddress || '[FBO Address]',
      fbo_license: sample?.fboLicense || '[FBO License Number]',
      establishment_name: sample?.establishmentName || '[Establishment Name]',
      inspection_date: sample?.inspectionDate ? formatDate(sample.inspectionDate) : '[Inspection Date]',
      inspection_type: sample?.inspectionType || '[Inspection Type]',
      sample_code: sample?.code || '[Sample Code]',
      sample_name: sample?.name || '[Sample Name]',
      sample_type: sample?.sampleType === 'enforcement' ? 'Enforcement' : sample?.sampleType === 'surveillance' ? 'Surveillance' : '[Sample Type]',
      sample_lifted_date: sample?.liftedDate ? formatDate(sample.liftedDate) : '[Lifted Date]',
      sample_lifted_place: sample?.liftedPlace || '[Lifted Place]',
      sample_cost: sample?.cost ? `Rs. ${sample.cost}` : '[Sample Cost]',
      sample_quantity: sample?.quantityInGrams ? `${sample.quantityInGrams} grams` : '[Quantity]',
      sample_packing_type: sample?.packingType === 'packed' ? 'Packed' : sample?.packingType === 'loose' ? 'Loose' : '[Packing Type]',
      sample_preservative: sample?.preservativeAdded ? (sample.preservativeType || 'Yes') : 'No',
      sample_dispatch_date: sample?.dispatchDate ? formatDate(sample.dispatchDate) : '[Dispatch Date]',
      sample_dispatch_mode: sample?.dispatchMode || '[Dispatch Mode]',
      manufacturer_name: sample?.manufacturerDetails?.name || '[Manufacturer Name]',
      manufacturer_address: sample?.manufacturerDetails?.address || '[Manufacturer Address]',
      manufacturer_license: sample?.manufacturerDetails?.licenseNumber || '[Manufacturer License]',
      mfg_date: sample?.mfgDate || '[Manufacturing Date]',
      expiry_date: sample?.useByDate || '[Expiry Date]',
      lot_batch_number: sample?.lotBatchNumber || '[Lot/Batch Number]',
      lab_report_date: sample?.labReportDate ? formatDate(sample.labReportDate) : '[Lab Report Date]',
      lab_result: sample?.labResult ? sample.labResult.replace('_', ' ').toUpperCase() : '[Lab Result]',
    };

    let result = content;
    Object.entries(placeholderValues).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return result;
  };

  const generatePdfHtml = (template: DocumentTemplate): string => {
    const content = replacePlaceholders(template.content);
    
    if (template.contentType === 'html') {
      return content;
    }
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
  </style>
</head>
<body>
  <pre>${content}</pre>
</body>
</html>`;
  };

  const handleDownload = async (template: DocumentTemplate) => {
    setDownloadingId(template.id);
    try {
      const html = generatePdfHtml(template);
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${template.name}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Generated', `Document saved to: ${uri}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to generate document. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading || !sample) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loadingContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {isLoading ? 'Loading...' : 'Sample not found'}
          </ThemedText>
        </View>
      </View>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isOverdue = sample.daysRemaining !== undefined && sample.daysRemaining <= 0 && !sample.labResult;
  const isUrgent = sample.daysRemaining !== undefined && sample.daysRemaining <= 3 && !sample.labResult;
  const countdownColor = isOverdue ? theme.accent : isUrgent ? theme.warning : theme.primary;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }, Shadows.md]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Feather name="droplet" size={24} color={theme.primary} />
            </View>
            <View style={styles.headerContent}>
              <ThemedText type="h2">{sample.name}</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {sample.code}
              </ThemedText>
            </View>
          </View>
          
          {sample.labResult ? (
            <View style={styles.resultContainer}>
              <ThemedText type="h4">Lab Result</ThemedText>
              <StatusBadge status={sample.labResult} size="medium" />
            </View>
          ) : sample.daysRemaining !== undefined ? (
            <View style={[styles.countdownCard, { backgroundColor: countdownColor + '10', borderColor: countdownColor }]}>
              <Feather name="clock" size={24} color={countdownColor} />
              <View style={styles.countdownContent}>
                <ThemedText type="h1" style={{ color: countdownColor }}>
                  {isOverdue ? 'OVERDUE' : sample.daysRemaining}
                </ThemedText>
                <ThemedText type="body" style={{ color: countdownColor }}>
                  {isOverdue ? 'Lab report was due' : 'days until deadline'}
                </ThemedText>
              </View>
            </View>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }, Shadows.md]}>
          <ThemedText type="h3" style={styles.sectionTitle}>Sample Details</ThemedText>
          
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: theme.primary + '15' }]}>
              <Feather name="map-pin" size={16} color={theme.primary} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Place of Lifting</ThemedText>
              <ThemedText type="body">{sample.liftedPlace}</ThemedText>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: theme.primary + '15' }]}>
              <Feather name="calendar" size={16} color={theme.primary} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Lifted Date</ThemedText>
              <ThemedText type="body">{formatDate(sample.liftedDate)}</ThemedText>
            </View>
          </View>
          
          {sample.dispatchMode ? (
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: theme.primary + '15' }]}>
                <Feather name="send" size={16} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Dispatch Mode</ThemedText>
                <ThemedText type="body" style={{ textTransform: 'capitalize' }}>
                  {sample.dispatchMode.replace('_', ' ')}
                </ThemedText>
              </View>
            </View>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }, Shadows.md]}>
          <ThemedText type="h3" style={styles.sectionTitle}>Sample Timeline</ThemedText>
          
          <View style={styles.timeline}>
            <TimelineStep
              icon="package"
              title="Sample Lifted"
              date={formatDate(sample.liftedDate)}
              isActive={!sample.dispatchDate}
              isComplete={!!sample.liftedDate}
            />
            <TimelineStep
              icon="truck"
              title="Dispatched to Lab"
              date={formatDate(sample.dispatchDate)}
              isActive={!!sample.dispatchDate && !sample.labReportDate}
              isComplete={!!sample.dispatchDate}
            />
            <TimelineStep
              icon="file-text"
              title="Lab Report Received"
              date={formatDate(sample.labReportDate)}
              isActive={!!sample.labReportDate}
              isComplete={!!sample.labReportDate}
              isLast
            />
          </View>
        </View>

        {sample.remarks ? (
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }, Shadows.md]}>
            <ThemedText type="h3" style={styles.sectionTitle}>Remarks</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {sample.remarks}
            </ThemedText>
          </View>
        ) : null}

        {/* Document Templates Section */}
        {templates.length > 0 ? (
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }, Shadows.md]}>
            <View style={styles.templatesHeader}>
              <View style={[styles.templateIconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Feather name="file-text" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h3">Document Templates</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Download documents with this sample's data pre-filled
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.templatesList}>
              {templates.map((template) => (
                <View 
                  key={template.id} 
                  style={[styles.templateItem, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                >
                  <View style={styles.templateInfo}>
                    <View style={[styles.categoryBadge, { backgroundColor: theme.primary + '15' }]}>
                      <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>
                        {template.category.replace('_', ' ').toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText type="body" style={{ fontWeight: '600', marginTop: Spacing.xs }}>
                      {template.name}
                    </ThemedText>
                    <View style={styles.templateMeta}>
                      <Feather name="file" size={12} color={theme.textSecondary} />
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {template.contentType === 'html' ? 'HTML' : 'Text'} - {template.pageSize.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <Pressable
                    style={[styles.downloadBtn, { backgroundColor: theme.primary }]}
                    onPress={() => handleDownload(template)}
                    disabled={downloadingId === template.id}
                  >
                    {downloadingId === template.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Feather name="download" size={16} color="white" />
                        <ThemedText type="small" style={{ color: 'white', fontWeight: '600' }}>
                          PDF
                        </ThemedText>
                      </>
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  countdownContent: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    gap: 2,
  },
  timeline: {
    gap: 0,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: 2,
  },
  templatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  templateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templatesList: {
    gap: Spacing.md,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});
