import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/useTheme';
import { ScannerStackParamList } from '@/navigation/ScannerStackNavigator';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

interface ScannedNote {
  id: string;
  data: string;
  type: string;
  heading: string;
  scannedAt: string;
}

const NOTES_STORAGE_KEY = '@scanned_notes';

export default function ScannerScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ScannerStackParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<{ data: string; type: string } | null>(null);
  const [heading, setHeading] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScannedData({ data: result.data, type: result.type });
    setHeading('');
    setModalVisible(true);
  };

  const saveNote = async () => {
    if (!scannedData) return;

    try {
      const existingNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      const notes: ScannedNote[] = existingNotes ? JSON.parse(existingNotes) : [];
      
      const newNote: ScannedNote = {
        id: Date.now().toString(),
        data: scannedData.data,
        type: scannedData.type,
        heading: heading.trim() || 'Untitled Scan',
        scannedAt: new Date().toISOString(),
      };
      
      notes.unshift(newNote);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setScannedData(null);
      setScanned(false);
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const cancelScan = () => {
    setModalVisible(false);
    setScannedData(null);
    setScanned(false);
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <Text style={[styles.message, { color: theme.text }]}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
        <View style={styles.permissionCard}>
          <Feather name="camera-off" size={64} color={Colors.light.primary} />
          <Text style={[styles.permissionTitle, { color: theme.text }]}>Camera Access Required</Text>
          <Text style={[styles.permissionText, { color: theme.textSecondary }]}>
            To scan QR codes and barcodes, please grant camera access.
          </Text>
          {permission.status === 'denied' && !permission.canAskAgain ? (
            Platform.OS !== 'web' ? (
              <Pressable
                style={[styles.permissionButton, { backgroundColor: Colors.light.primary }]}
                onPress={async () => {
                  try {
                    await Linking.openSettings();
                  } catch (error) {
                    console.error('Cannot open settings');
                  }
                }}
              >
                <Text style={styles.permissionButtonText}>Open Settings</Text>
              </Pressable>
            ) : (
              <Text style={[styles.webMessage, { color: theme.textSecondary }]}>
                Run in Expo Go to use this feature
              </Text>
            )
          ) : (
            <Pressable
              style={[styles.permissionButton, { backgroundColor: Colors.light.primary }]}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Enable Camera</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.viewNotesLink}
            onPress={() => navigation.navigate('ScannedNotes')}
            testID="view-scanned-notes"
          >
            <Feather name="file-text" size={18} color={Colors.light.primary} />
            <Text style={[styles.viewNotesLinkText, { color: Colors.light.primary }]}>
              View Saved Notes
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'code39',
            'code93',
            'code128',
            'codabar',
            'itf14',
            'pdf417',
            'aztec',
            'datamatrix',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={[styles.overlay, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Code</Text>
          <View style={styles.headerButtons}>
            <Pressable
              style={styles.notesButton}
              onPress={() => navigation.navigate('ScannedNotes')}
            >
              <Feather name="file-text" size={22} color="#fff" />
            </Pressable>
            <Pressable
              style={[styles.flashButton, flashEnabled && styles.flashButtonActive]}
              onPress={() => setFlashEnabled(!flashEnabled)}
            >
              <Feather name={flashEnabled ? 'zap' : 'zap-off'} size={24} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanHint}>
            Position QR code or barcode within the frame
          </Text>
        </View>

        <View style={[styles.bottomInfo, { paddingBottom: tabBarHeight + Spacing.lg }]}>
          <View style={styles.supportedCodes}>
            <Feather name="check-circle" size={16} color="#fff" />
            <Text style={styles.supportedText}>QR, EAN, UPC, Code128, PDF417 & more</Text>
          </View>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={cancelScan}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Save Scanned Data</Text>
              <Pressable onPress={cancelScan}>
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.scannedInfo}>
              <View style={[styles.codeTypeTag, { backgroundColor: Colors.light.primary + '20' }]}>
                <Feather name="code" size={14} color={Colors.light.primary} />
                <Text style={[styles.codeTypeText, { color: Colors.light.primary }]}>
                  {scannedData?.type?.toUpperCase() || 'CODE'}
                </Text>
              </View>
              <Text style={[styles.scannedDataText, { color: theme.text }]} numberOfLines={3}>
                {scannedData?.data}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Heading / Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter a title for this scan"
                placeholderTextColor={theme.textSecondary}
                value={heading}
                onChangeText={setHeading}
                autoFocus
              />
            </View>

            <View style={styles.dateInfo}>
              <Feather name="calendar" size={14} color={theme.textSecondary} />
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                onPress={cancelScan}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: Colors.light.primary }]}
                onPress={saveNote}
              >
                <Feather name="save" size={18} color="#fff" />
                <Text style={styles.saveButtonText}>Save Note</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
  },
  permissionCard: {
    alignItems: 'center',
    padding: Spacing['3xl'],
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['3xl'],
    borderRadius: BorderRadius.lg,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  viewNotesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  viewNotesLinkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notesButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButtonActive: {
    backgroundColor: Colors.light.warning,
  },
  scanArea: {
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  bottomInfo: {
    alignItems: 'center',
  },
  supportedCodes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  supportedText: {
    color: '#fff',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scannedInfo: {
    marginBottom: Spacing.lg,
  },
  codeTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  codeTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scannedDataText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  dateText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {},
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
