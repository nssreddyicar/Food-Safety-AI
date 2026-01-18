import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Platform, Modal, TextInput, KeyboardAvoidingView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { StatusBadge } from '@/components/StatusBadge';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/context/AuthContext';
import { storage } from '@/lib/storage';
import { getApiUrl, apiRequest } from '@/lib/query-client';
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

interface InputField {
  name: string;
  type: 'text' | 'date' | 'select' | 'textarea' | 'number' | 'image';
  label: string;
  required?: boolean;
  options?: string[];
}

interface WorkflowNode {
  id: string;
  name: string;
  description: string;
  position: number;
  nodeType: 'action' | 'decision' | 'end';
  icon: string;
  color: string;
  inputFields: InputField[];
  templateIds: string[];
  isStartNode: boolean;
  isEndNode: boolean;
  autoAdvanceCondition?: string;
  status: string;
}

interface WorkflowTransition {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  conditionType: 'always' | 'lab_result' | 'field_value';
  conditionField?: string;
  conditionOperator?: 'equals' | 'not_equals' | 'contains';
  conditionValue?: string;
  label?: string;
  status: string;
}

interface WorkflowState {
  id: string;
  sampleId: string;
  currentNodeId: string;
  nodeData: Record<string, any> | null;
  enteredAt: string;
  completedAt: string | null;
  status: 'active' | 'completed' | 'skipped';
}

type RouteParams = {
  SampleDetails: { sampleId: string };
};

const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
  'package': 'package',
  'truck': 'truck',
  'file-text': 'file-text',
  'check-circle': 'check-circle',
  'alert-triangle': 'alert-triangle',
  'clock': 'clock',
  'shield': 'shield',
  'send': 'send',
};

interface DynamicTimelineStepProps {
  node: WorkflowNode;
  date?: string;
  isActive: boolean;
  isComplete: boolean;
  isLast?: boolean;
  isBranch?: boolean;
  branchLabel?: string;
  savedData?: Record<string, any> | null;
  templates?: DocumentTemplate[];
  onPress: () => void;
}

function DynamicTimelineStep({ node, date, isActive, isComplete, isLast, isBranch, branchLabel, savedData, templates = [], onPress }: DynamicTimelineStepProps) {
  const { theme } = useTheme();
  const nodeColor = node.color || theme.primary;
  const color = isComplete ? theme.success : isActive ? nodeColor : theme.textSecondary;
  const iconName = iconMap[node.icon] || 'circle';
  
  const assignedTemplates = templates.filter(t => node.templateIds?.includes(t.id));
  
  return (
    <Pressable onPress={onPress} style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineIcon, { backgroundColor: color + '20', borderColor: color }]}>
          <Feather name={isComplete ? 'check' : iconName} size={16} color={color} />
        </View>
        {!isLast ? (
          <View style={[styles.timelineLine, { backgroundColor: isComplete ? theme.success : theme.border }]} />
        ) : null}
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <ThemedText type="h4" style={{ color }}>{node.name}</ThemedText>
          {node.nodeType === 'decision' ? (
            <View style={[styles.nodeTypeBadge, { backgroundColor: theme.warning + '20' }]}>
              <ThemedText type="small" style={{ color: theme.warning, fontSize: 10 }}>DECISION</ThemedText>
            </View>
          ) : node.isEndNode ? (
            <View style={[styles.nodeTypeBadge, { backgroundColor: theme.success + '20' }]}>
              <ThemedText type="small" style={{ color: theme.success, fontSize: 10 }}>END</ThemedText>
            </View>
          ) : null}
          <View style={[styles.tapBadge, { backgroundColor: theme.primary + '15' }]}>
            <Feather name="edit-2" size={10} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary, fontSize: 10 }}>TAP</ThemedText>
          </View>
        </View>
        {isBranch && branchLabel ? (
          <ThemedText type="small" style={{ color: theme.warning, fontStyle: 'italic' }}>{branchLabel}</ThemedText>
        ) : null}
        {date ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>{date}</ThemedText>
        ) : (
          <ThemedText type="small" style={{ color: theme.textDisabled }}>Pending</ThemedText>
        )}
        {node.description ? (
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>{node.description}</ThemedText>
        ) : null}
        {assignedTemplates.length > 0 ? (
          <View style={[styles.nodeTemplatesContainer, { backgroundColor: theme.primary + '08', borderColor: theme.primary + '20' }]}>
            <View style={styles.nodeTemplatesHeader}>
              <Feather name="file-text" size={12} color={theme.primary} />
              <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>Documents</ThemedText>
            </View>
            <View style={styles.nodeTemplatesList}>
              {assignedTemplates.map(template => (
                <View key={template.id} style={[styles.nodeTemplateChip, { backgroundColor: theme.primary + '15' }]}>
                  <ThemedText type="small" style={{ color: theme.primary, fontSize: 11 }} numberOfLines={1}>
                    {template.name}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {savedData && Object.keys(savedData).length > 0 ? (
          <View style={[styles.savedDataContainer, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}>
            <View style={styles.savedDataHeader}>
              <Feather name="check-circle" size={12} color={theme.success} />
              <ThemedText type="small" style={{ color: theme.success, fontWeight: '600' }}>Update Recorded</ThemedText>
            </View>
            {Object.entries(savedData).slice(0, 3).map(([key, value]) => (
              <View key={key} style={styles.savedDataRow}>
                <ThemedText type="small" style={{ color: theme.textSecondary, textTransform: 'capitalize' }}>
                  {key.replace(/_/g, ' ')}:
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.text }} numberOfLines={1} ellipsizeMode="tail">
                  {String(value)}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
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
  const queryClient = useQueryClient();
  
  const [sample, setSample] = useState<SampleWithInspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);

  const sampleId = route.params.sampleId;

  const { data: templates = [] } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/templates'],
  });

  const { data: workflowNodes = [] } = useQuery<WorkflowNode[]>({
    queryKey: ['/api/admin/workflow/nodes'],
  });

  const { data: workflowTransitions = [] } = useQuery<WorkflowTransition[]>({
    queryKey: ['/api/admin/workflow/transitions'],
  });

  const { data: workflowStates = [], refetch: refetchWorkflowStates } = useQuery<WorkflowState[]>({
    queryKey: ['/api/samples', sampleId, 'workflow-state'],
    queryFn: async () => {
      const url = new URL(`/api/samples/${sampleId}/workflow-state`, getApiUrl());
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch workflow state');
      return response.json();
    },
    enabled: !!sampleId,
  });

  const saveWorkflowStateMutation = useMutation({
    mutationFn: async ({ nodeId, nodeData }: { nodeId: string; nodeData: Record<string, any> }) => {
      return apiRequest('POST', `/api/samples/${sampleId}/workflow-state`, { nodeId, nodeData });
    },
    onSuccess: () => {
      refetchWorkflowStates();
      queryClient.invalidateQueries({ queryKey: ['/api/samples', sampleId, 'workflow-state'] });
    },
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

  const getStateForNode = useCallback((nodeId: string): WorkflowState | undefined => {
    return workflowStates.find(s => s.currentNodeId === nodeId);
  }, [workflowStates]);

  const openNodeModal = (node: WorkflowNode) => {
    const existingState = getStateForNode(node.id);
    setSelectedNode(node);
    setFormData(existingState?.nodeData || {});
    setModalVisible(true);
  };

  const handleSaveNodeData = async () => {
    if (!selectedNode) return;
    
    setIsSaving(true);
    try {
      await saveWorkflowStateMutation.mutateAsync({
        nodeId: selectedNode.id,
        nodeData: formData,
      });
      setModalVisible(false);
      setSelectedNode(null);
      setFormData({});
      Alert.alert('Success', 'Workflow update saved successfully');
    } catch (error) {
      console.error('Failed to save workflow state:', error);
      Alert.alert('Error', 'Failed to save workflow update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const replacePlaceholders = (content: string): string => {
    const now = new Date();
    
    const formatDateFn = (dateStr?: string) => {
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
      inspection_date: sample?.inspectionDate ? formatDateFn(sample.inspectionDate) : '[Inspection Date]',
      inspection_type: sample?.inspectionType || '[Inspection Type]',
      sample_code: sample?.code || '[Sample Code]',
      sample_name: sample?.name || '[Sample Name]',
      sample_type: sample?.sampleType === 'enforcement' ? 'Enforcement' : sample?.sampleType === 'surveillance' ? 'Surveillance' : '[Sample Type]',
      sample_lifted_date: sample?.liftedDate ? formatDateFn(sample.liftedDate) : '[Lifted Date]',
      sample_lifted_place: sample?.liftedPlace || '[Lifted Place]',
      sample_cost: sample?.cost ? `Rs. ${sample.cost}` : '[Sample Cost]',
      sample_quantity: sample?.quantityInGrams ? `${sample.quantityInGrams} grams` : '[Quantity]',
      sample_packing_type: sample?.packingType === 'packed' ? 'Packed' : sample?.packingType === 'loose' ? 'Loose' : '[Packing Type]',
      sample_preservative: sample?.preservativeAdded ? (sample.preservativeType || 'Yes') : 'No',
      sample_dispatch_date: sample?.dispatchDate ? formatDateFn(sample.dispatchDate) : '[Dispatch Date]',
      sample_dispatch_mode: sample?.dispatchMode || '[Dispatch Mode]',
      manufacturer_name: sample?.manufacturerDetails?.name || '[Manufacturer Name]',
      manufacturer_address: sample?.manufacturerDetails?.address || '[Manufacturer Address]',
      manufacturer_license: sample?.manufacturerDetails?.licenseNumber || '[Manufacturer License]',
      mfg_date: sample?.mfgDate || '[Manufacturing Date]',
      expiry_date: sample?.useByDate || '[Expiry Date]',
      lot_batch_number: sample?.lotBatchNumber || '[Lot/Batch Number]',
      lab_report_date: sample?.labReportDate ? formatDateFn(sample.labReportDate) : '[Lab Report Date]',
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

  const getSampleWorkflowPosition = () => {
    if (!sample) return { currentNodeIndex: -1, completedNodes: new Set<number>() };
    
    const sortedNodes = [...workflowNodes].sort((a, b) => a.position - b.position);
    const completedNodes = new Set<number>();
    let currentNodeIndex = 0;

    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i];
      const nodeState = getStateForNode(node.id);
      const nodeName = node.name.toLowerCase();
      
      if (nodeState?.status === 'completed') {
        completedNodes.add(i);
        currentNodeIndex = i + 1;
      } else if (nodeName.includes('lifted') || nodeName.includes('sample lifted')) {
        if (sample.liftedDate) {
          completedNodes.add(i);
          currentNodeIndex = i + 1;
        }
      } else if (nodeName.includes('dispatch') || nodeName.includes('lab')) {
        if (nodeName.includes('dispatch')) {
          if (sample.dispatchDate) {
            completedNodes.add(i);
            currentNodeIndex = i + 1;
          }
        } else if (nodeName.includes('report') || nodeName.includes('received')) {
          if (sample.labReportDate) {
            completedNodes.add(i);
            currentNodeIndex = i + 1;
          }
        }
      } else if (node.nodeType === 'decision' && sample.labReportDate) {
        completedNodes.add(i);
        currentNodeIndex = i + 1;
      }
    }
    
    return { currentNodeIndex: Math.min(currentNodeIndex, sortedNodes.length - 1), completedNodes };
  };

  const getRelevantBranchNodes = () => {
    if (!sample?.labResult) return [];
    
    const sortedNodes = [...workflowNodes].sort((a, b) => a.position - b.position);
    const decisionNode = sortedNodes.find(n => n.nodeType === 'decision');
    if (!decisionNode) return [];

    const relevantTransitions = workflowTransitions.filter(t => 
      t.fromNodeId === decisionNode.id && 
      t.conditionType === 'lab_result' &&
      t.conditionValue?.toLowerCase() === sample.labResult?.toLowerCase()
    );

    return relevantTransitions.map(t => {
      const targetNode = workflowNodes.find(n => n.id === t.toNodeId);
      return { node: targetNode, transition: t };
    }).filter(item => item.node) as Array<{ node: WorkflowNode; transition: WorkflowTransition }>;
  };

  const renderDynamicTimeline = () => {
    if (workflowNodes.length === 0) {
      return (
        <View style={styles.emptyWorkflow}>
          <Feather name="loader" size={24} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Loading workflow configuration...
          </ThemedText>
        </View>
      );
    }

    const sortedNodes = [...workflowNodes].sort((a, b) => a.position - b.position);
    const mainNodes = sortedNodes.filter(n => !n.isEndNode && n.nodeType !== 'end' && n.position <= 2);
    const { currentNodeIndex, completedNodes } = getSampleWorkflowPosition();
    const branchNodes = getRelevantBranchNodes();
    
    const getDateForNode = (node: WorkflowNode) => {
      const nodeState = getStateForNode(node.id);
      if (nodeState?.completedAt) {
        return formatDate(nodeState.completedAt);
      }
      const nodeName = node.name.toLowerCase();
      if (nodeName.includes('lifted')) return formatDate(sample?.liftedDate);
      if (nodeName.includes('dispatch')) return formatDate(sample?.dispatchDate);
      if (nodeName.includes('report') || nodeName.includes('received')) return formatDate(sample?.labReportDate);
      return undefined;
    };

    const timeline = mainNodes.map((node, idx) => {
      const isComplete = completedNodes.has(idx);
      const isActive = idx === currentNodeIndex;
      const isLast = idx === mainNodes.length - 1 && branchNodes.length === 0;
      const nodeState = getStateForNode(node.id);
      
      return (
        <DynamicTimelineStep
          key={node.id}
          node={node}
          date={getDateForNode(node)}
          isActive={isActive}
          isComplete={isComplete}
          isLast={isLast}
          savedData={nodeState?.nodeData}
          templates={templates}
          onPress={() => openNodeModal(node)}
        />
      );
    });

    if (branchNodes.length > 0) {
      branchNodes.forEach((item, idx) => {
        const nodeState = getStateForNode(item.node.id);
        timeline.push(
          <DynamicTimelineStep
            key={item.node.id}
            node={item.node}
            date={nodeState?.completedAt ? formatDate(nodeState.completedAt) : undefined}
            isActive={sample?.labReportDate != null}
            isComplete={nodeState?.status === 'completed'}
            isLast={idx === branchNodes.length - 1}
            isBranch={true}
            branchLabel={item.transition.label}
            savedData={nodeState?.nodeData}
            templates={templates}
            onPress={() => openNodeModal(item.node)}
          />
        );
      });
    } else if (mainNodes.length > 0) {
      const decisionNode = sortedNodes.find(n => n.nodeType === 'decision');
      if (decisionNode && sample?.labReportDate && !sample?.labResult) {
        const pendingTransitions = workflowTransitions.filter(t => t.fromNodeId === decisionNode.id);
        if (pendingTransitions.length > 0) {
          timeline.push(
            <View key="pending-branch" style={styles.branchInfo}>
              <Feather name="git-branch" size={16} color={theme.warning} />
              <ThemedText type="small" style={{ color: theme.warning }}>
                Awaiting lab result to determine next step...
              </ThemedText>
            </View>
          );
        }
      }
    }

    return timeline;
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

  const renderInputField = (field: InputField) => {
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <View key={field.name} style={styles.formField}>
            <ThemedText type="body" style={styles.fieldLabel}>
              {field.label}{field.required ? ' *' : ''}
            </ThemedText>
            <TextInput
              style={[styles.textArea, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundRoot }]}
              value={value}
              onChangeText={(text) => setFormData(prev => ({ ...prev, [field.name]: text }))}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              placeholderTextColor={theme.textDisabled}
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 'date':
        const formatDateValue = (dateStr: string) => {
          if (!dateStr) return '';
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          } catch {
            return dateStr;
          }
        };
        
        const parseDateValue = (dateStr: string): Date => {
          if (!dateStr) return new Date();
          const parts = dateStr.split('-');
          if (parts.length === 3 && parts[0].length === 2) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
          const parsed = new Date(dateStr);
          return isNaN(parsed.getTime()) ? new Date() : parsed;
        };
        
        return (
          <View key={field.name} style={styles.formField}>
            <ThemedText type="body" style={styles.fieldLabel}>
              {field.label}{field.required ? ' *' : ''}
            </ThemedText>
            <Pressable
              style={[styles.dateInput, { borderColor: theme.border, backgroundColor: theme.backgroundRoot }]}
              onPress={() => {
                setActiveDateField(field.name);
                setShowDatePicker(true);
              }}
            >
              <Feather name="calendar" size={18} color={theme.primary} />
              <ThemedText type="body" style={{ color: value ? theme.text : theme.textDisabled, flex: 1 }}>
                {value ? formatDateValue(value) : 'DD-MM-YYYY'}
              </ThemedText>
            </Pressable>
            {showDatePicker && activeDateField === field.name ? (
              Platform.OS === 'web' ? (
                <View style={styles.webDatePickerContainer}>
                  <input
                    type="date"
                    value={value ? parseDateValue(value).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      setFormData(prev => ({ ...prev, [field.name]: `${day}-${month}-${year}` }));
                      setShowDatePicker(false);
                      setActiveDateField(null);
                    }}
                    style={{
                      padding: 12,
                      fontSize: 16,
                      borderRadius: 8,
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.backgroundDefault,
                      color: theme.text,
                      width: '100%',
                    }}
                  />
                </View>
              ) : (
                <DateTimePicker
                  value={parseDateValue(value)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      const day = String(selectedDate.getDate()).padStart(2, '0');
                      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const year = selectedDate.getFullYear();
                      setFormData(prev => ({ ...prev, [field.name]: `${day}-${month}-${year}` }));
                    }
                    if (Platform.OS !== 'ios') {
                      setActiveDateField(null);
                    }
                  }}
                />
              )
            ) : null}
          </View>
        );
      case 'select':
        return (
          <View key={field.name} style={styles.formField}>
            <ThemedText type="body" style={styles.fieldLabel}>
              {field.label}{field.required ? ' *' : ''}
            </ThemedText>
            <View style={styles.selectOptions}>
              {field.options?.map(option => (
                <Pressable
                  key={option}
                  style={[
                    styles.selectOption,
                    { 
                      borderColor: value === option ? theme.primary : theme.border,
                      backgroundColor: value === option ? theme.primary + '15' : theme.backgroundRoot 
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, [field.name]: option }))}
                >
                  <ThemedText type="small" style={{ color: value === option ? theme.primary : theme.text }}>
                    {option}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 'number':
        return (
          <View key={field.name} style={styles.formField}>
            <ThemedText type="body" style={styles.fieldLabel}>
              {field.label}{field.required ? ' *' : ''}
            </ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundRoot }]}
              value={value}
              onChangeText={(text) => setFormData(prev => ({ ...prev, [field.name]: text }))}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              placeholderTextColor={theme.textDisabled}
              keyboardType="numeric"
            />
          </View>
        );
      case 'image':
        const pickImage = async () => {
          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setFormData(prev => ({ ...prev, [field.name]: result.assets[0].uri }));
          }
        };
        
        const takePhoto = async () => {
          const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
          if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Please allow access to your camera to take photos.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setFormData(prev => ({ ...prev, [field.name]: result.assets[0].uri }));
          }
        };
        
        const removeImage = () => {
          setFormData(prev => ({ ...prev, [field.name]: '' }));
        };
        
        return (
          <View key={field.name} style={styles.formField}>
            <ThemedText type="body" style={styles.fieldLabel}>
              {field.label}{field.required ? ' *' : ''}
            </ThemedText>
            {value ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: value }} style={styles.imagePreview} resizeMode="cover" />
                <Pressable 
                  style={[styles.removeImageButton, { backgroundColor: theme.accent }]}
                  onPress={removeImage}
                >
                  <Feather name="x" size={16} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <View style={styles.imageButtonsContainer}>
                <Pressable
                  style={[styles.imageButton, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
                  onPress={takePhoto}
                >
                  <Feather name="camera" size={20} color={theme.primary} />
                  <ThemedText type="small" style={{ color: theme.primary, marginTop: 4 }}>Camera</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.imageButton, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
                  onPress={pickImage}
                >
                  <Feather name="image" size={20} color={theme.primary} />
                  <ThemedText type="small" style={{ color: theme.primary, marginTop: 4 }}>Gallery</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        );
      default:
        return (
          <View key={field.name} style={styles.formField}>
            <ThemedText type="body" style={styles.fieldLabel}>
              {field.label}{field.required ? ' *' : ''}
            </ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundRoot }]}
              value={value}
              onChangeText={(text) => setFormData(prev => ({ ...prev, [field.name]: text }))}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              placeholderTextColor={theme.textDisabled}
            />
          </View>
        );
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

  const inputFields: InputField[] = selectedNode?.inputFields || [];
  const hasInputFields = inputFields.length > 0;

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
          <View style={styles.workflowHeader}>
            <ThemedText type="h3">Sample Workflow</ThemedText>
            <View style={[styles.interactiveHint, { backgroundColor: theme.primary + '10' }]}>
              <Feather name="info" size={14} color={theme.primary} />
              <ThemedText type="small" style={{ color: theme.primary }}>Tap nodes to add updates</ThemedText>
            </View>
          </View>
          
          <View style={styles.timeline}>
            {renderDynamicTimeline()}
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="h3" style={{ flex: 1, textAlign: 'center' }}>
              {selectedNode?.name}
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {selectedNode?.description ? (
              <View style={[styles.nodeDescriptionCard, { backgroundColor: theme.primary + '10' }]}>
                <Feather name="info" size={16} color={theme.primary} />
                <ThemedText type="body" style={{ color: theme.primary, flex: 1 }}>
                  {selectedNode.description}
                </ThemedText>
              </View>
            ) : null}
            
            {hasInputFields ? (
              inputFields.map(field => renderInputField(field))
            ) : (
              <View style={styles.noFieldsContainer}>
                <View style={[styles.noFieldsIcon, { backgroundColor: theme.textSecondary + '15' }]}>
                  <Feather name="edit-3" size={32} color={theme.textSecondary} />
                </View>
                <ThemedText type="h4" style={{ color: theme.text, textAlign: 'center' }}>
                  Add Notes
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  Record any notes or observations for this workflow step
                </ThemedText>
                <View style={styles.formField}>
                  <TextInput
                    style={[styles.textArea, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundDefault }]}
                    value={formData.notes || ''}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                    placeholder="Enter your notes here..."
                    placeholderTextColor={theme.textDisabled}
                    multiline
                    numberOfLines={6}
                  />
                </View>
              </View>
            )}
          </ScrollView>
          
          <View style={[styles.modalFooter, { borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.md }]}>
            <Pressable
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText type="body" style={{ color: theme.text }}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSaveNodeData}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name="check" size={18} color="white" />
                  <ThemedText type="body" style={{ color: 'white', fontWeight: '600' }}>Save Update</ThemedText>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  workflowHeader: {
    gap: Spacing.sm,
  },
  interactiveHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  timeline: {
    gap: 0,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 70,
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
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  nodeTypeBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  tapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  savedDataContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  savedDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  savedDataRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  emptyWorkflow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingLeft: 52,
    paddingVertical: Spacing.sm,
    marginTop: -Spacing.md,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  nodeDescriptionCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  noFieldsContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  noFieldsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  formField: {
    gap: Spacing.xs,
    width: '100%',
  },
  fieldLabel: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  selectOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  selectOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  webDatePickerContainer: {
    marginTop: Spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imageButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeTemplatesContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  nodeTemplatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nodeTemplatesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  nodeTemplateChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
});
