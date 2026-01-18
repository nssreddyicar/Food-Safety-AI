import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, Switch, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/context/AuthContext';
import { storage } from '@/lib/storage';
import { Inspection, Deviation } from '@/types';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

const INSPECTION_TYPES = ['Routine', 'Special Drive', 'Complaint Based', 'VVIP', 'Initiatives'];
const ACTION_OPTIONS = ['Warning Issued', 'Improvement Notice', 'Seizure', 'Prosecution Initiated', 'No Issues Found'];
const DEVIATION_CATEGORIES = ['Hygiene', 'Labelling', 'Storage', 'Documentation', 'Adulteration', 'Other'];

export default function NewInspectionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [inspectionType, setInspectionType] = useState('Routine');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  const [fboName, setFboName] = useState('');
  const [fboAddress, setFboAddress] = useState('');
  const [hasLicense, setHasLicense] = useState(true);
  const [licenseNumber, setLicenseNumber] = useState('');
  
  const [proprietorSame, setProprietorSame] = useState(false);
  const [proprietorName, setProprietorName] = useState('');
  const [proprietorAddress, setProprietorAddress] = useState('');
  const [proprietorPhone, setProprietorPhone] = useState('');
  
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [sampleLifted, setSampleLifted] = useState(false);
  const [sampleName, setSampleName] = useState('');
  const [samplePlace, setSamplePlace] = useState('');

  const handleAddDeviation = () => {
    const newDeviation: Deviation = {
      id: `dev_${Date.now()}`,
      category: 'Hygiene',
      description: '',
      severity: 'minor',
    };
    setDeviations([...deviations, newDeviation]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveDeviation = (id: string) => {
    setDeviations(deviations.filter((d) => d.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpdateDeviation = (id: string, field: keyof Deviation, value: string) => {
    setDeviations(deviations.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const toggleAction = (action: string) => {
    if (selectedActions.includes(action)) {
      setSelectedActions(selectedActions.filter((a) => a !== action));
    } else {
      setSelectedActions([...selectedActions, action]);
    }
    Haptics.selectionAsync();
  };

  const handleSaveDraft = async () => {
    await saveInspection('draft');
  };

  const handleSubmit = async () => {
    if (!fboName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await saveInspection('submitted');
  };

  const saveInspection = async (status: 'draft' | 'submitted') => {
    setIsLoading(true);
    try {
      const inspection: Inspection = {
        id: `insp_${Date.now()}`,
        type: inspectionType,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fboDetails: {
          name: fboName,
          address: fboAddress,
          licenseNumber: hasLicense ? licenseNumber : undefined,
          hasLicense,
        },
        proprietorDetails: {
          name: proprietorSame ? fboName : proprietorName,
          address: proprietorSame ? fboAddress : proprietorAddress,
          phone: proprietorPhone,
          isSameAsFBO: proprietorSame,
        },
        deviations,
        actionsTaken: selectedActions,
        sampleLifted,
        samples: sampleLifted && sampleName
          ? [
              {
                id: `sample_${Date.now()}`,
                inspectionId: `insp_${Date.now()}`,
                name: sampleName,
                code: `${user?.district?.substring(0, 3).toUpperCase() || 'XXX'}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
                liftedDate: new Date().toISOString(),
                liftedPlace: samplePlace,
              },
            ]
          : [],
        witnesses: [],
        fsoId: user?.id || '',
        fsoName: user?.name || '',
        district: user?.district || '',
      };

      await storage.addInspection(inspection);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save inspection:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing['2xl'],
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <ThemedText type="h3">Inspection Type</ThemedText>
          <Pressable
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            style={[styles.dropdown, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
          >
            <ThemedText>{inspectionType}</ThemedText>
            <Feather name={showTypeDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textSecondary} />
          </Pressable>
          {showTypeDropdown ? (
            <View style={[styles.dropdownMenu, { backgroundColor: theme.backgroundDefault }, Shadows.lg]}>
              {INSPECTION_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => {
                    setInspectionType(type);
                    setShowTypeDropdown(false);
                    Haptics.selectionAsync();
                  }}
                  style={[styles.dropdownItem, type === inspectionType && { backgroundColor: theme.primary + '15' }]}
                >
                  <ThemedText style={type === inspectionType ? { color: theme.primary, fontWeight: '600' } : undefined}>
                    {type}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <ThemedText type="h3">FBO Details</ThemedText>
          <Input label="Business Name" placeholder="Enter FBO name" value={fboName} onChangeText={setFboName} testID="input-fbo-name" />
          <Input label="Address" placeholder="Enter complete address" value={fboAddress} onChangeText={setFboAddress} multiline testID="input-fbo-address" />
          
          <View style={styles.switchRow}>
            <ThemedText type="body">Has Food License/Registration?</ThemedText>
            <Switch
              value={hasLicense}
              onValueChange={setHasLicense}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {hasLicense ? (
            <Input label="License/Registration Number" placeholder="Enter license number" value={licenseNumber} onChangeText={setLicenseNumber} testID="input-license" />
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <ThemedText type="h3">Proprietor Details</ThemedText>
            <View style={styles.switchContainer}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Same as FBO</ThemedText>
              <Switch
                value={proprietorSame}
                onValueChange={setProprietorSame}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          {!proprietorSame ? (
            <>
              <Input label="Name" placeholder="Proprietor name" value={proprietorName} onChangeText={setProprietorName} />
              <Input label="Address" placeholder="Proprietor address" value={proprietorAddress} onChangeText={setProprietorAddress} />
            </>
          ) : null}
          <Input label="Phone" placeholder="Contact number" value={proprietorPhone} onChangeText={setProprietorPhone} keyboardType="phone-pad" />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3">Deviations Found</ThemedText>
            <Pressable onPress={handleAddDeviation} style={[styles.addButton, { borderColor: theme.primary }]}>
              <Feather name="plus" size={16} color={theme.primary} />
              <ThemedText type="small" style={{ color: theme.primary }}>Add</ThemedText>
            </Pressable>
          </View>
          
          {deviations.length === 0 ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>No deviations added</ThemedText>
          ) : null}
          
          {deviations.map((deviation, index) => (
            <View key={deviation.id} style={[styles.deviationCard, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.deviationHeader}>
                <ThemedText type="h4">Deviation {index + 1}</ThemedText>
                <Pressable onPress={() => handleRemoveDeviation(deviation.id)}>
                  <Feather name="trash-2" size={18} color={theme.accent} />
                </Pressable>
              </View>
              <Input
                placeholder="Describe the deviation"
                value={deviation.description}
                onChangeText={(text) => handleUpdateDeviation(deviation.id, 'description', text)}
                multiline
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="h3">Actions Taken</ThemedText>
          <View style={styles.actionsGrid}>
            {ACTION_OPTIONS.map((action) => {
              const isSelected = selectedActions.includes(action);
              return (
                <Pressable
                  key={action}
                  onPress={() => toggleAction(action)}
                  style={[
                    styles.actionChip,
                    { borderColor: isSelected ? theme.primary : theme.border, backgroundColor: isSelected ? theme.primary + '15' : 'transparent' },
                  ]}
                >
                  <Feather name={isSelected ? 'check-square' : 'square'} size={16} color={isSelected ? theme.primary : theme.textSecondary} />
                  <ThemedText type="small" style={isSelected ? { color: theme.primary } : undefined}>{action}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <ThemedText type="h3">Sample Lifted</ThemedText>
            <Switch
              value={sampleLifted}
              onValueChange={setSampleLifted}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {sampleLifted ? (
            <>
              <Input label="Sample Name" placeholder="e.g., Cooking Oil Sample" value={sampleName} onChangeText={setSampleName} />
              <Input label="Place of Lifting" placeholder="e.g., Kitchen Area" value={samplePlace} onChangeText={setSamplePlace} />
            </>
          ) : null}
        </View>

        <View style={styles.buttonRow}>
          <Button onPress={handleSaveDraft} style={[styles.draftButton, { backgroundColor: theme.backgroundSecondary }]} disabled={isLoading}>
            <ThemedText style={{ color: theme.text }}>Save Draft</ThemedText>
          </Button>
          <Button onPress={handleSubmit} style={styles.submitButton} disabled={isLoading || !fboName.trim()}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : 'Submit'}
          </Button>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing['2xl'],
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    borderRadius: BorderRadius.md,
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  deviationCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  deviationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  draftButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
