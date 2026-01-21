import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import ViewShot from "react-native-view-shot";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { useAuthContext } from "@/context/AuthContext";
import { Spacing, FontSize, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import {
  EvidenceImage,
  ImageMetadata,
  generateWatermarkLines,
  generateUniqueId,
} from "@/lib/image-watermark";

interface Pillar {
  id: string;
  pillarNumber: number;
  name: string;
  indicators: Indicator[];
}

interface Indicator {
  id: string;
  indicatorNumber: number;
  name: string;
  riskLevel: 'high' | 'medium' | 'low';
  weight: number;
}

interface IndicatorResponse {
  indicatorId: string;
  response: 'yes' | 'no' | 'na';
  images?: string[];
}

interface InspectionInfo {
  institutionName?: string;
  institutionAddress?: string;
}

const RISK_COLORS = {
  high: { bg: '#FEE2E2', text: '#DC2626' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  low: { bg: '#D1FAE5', text: '#059669' },
};

interface IndicatorImageData {
  [indicatorId: string]: EvidenceImage[];
}

export default function SafetyAssessmentScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();

  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [responses, setResponses] = useState<Record<string, IndicatorResponse>>({});
  const [indicatorImages, setIndicatorImages] = useState<IndicatorImageData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorePreview, setScorePreview] = useState<{
    totalScore: number;
    riskClassification: string;
  } | null>(null);

  const [institutionName, setInstitutionName] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: string;
    longitude: string;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const viewShotRefs = useRef<Record<string, React.RefObject<ViewShot | null>>>({});

  useEffect(() => {
    loadFormConfig();
    requestLocation();
  }, []);

  useEffect(() => {
    if (pillars.length > 0 && Object.keys(responses).length > 0) {
      calculatePreview();
    }
  }, [responses]);

  const requestLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation({
          latitude: String(location.coords.latitude),
          longitude: String(location.coords.longitude),
        });
      }
    } catch (error) {
      console.error("Location error:", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const loadFormConfig = async () => {
    try {
      const response = await fetch(
        new URL('/api/institutional-inspections/form-config', getApiUrl()).toString()
      );
      if (response.ok) {
        const data = await response.json();
        setPillars(data.pillars);
        
        const initialResponses: Record<string, IndicatorResponse> = {};
        data.pillars.forEach((pillar: Pillar) => {
          pillar.indicators.forEach((ind: Indicator) => {
            initialResponses[ind.id] = { indicatorId: ind.id, response: 'yes' };
          });
        });
        setResponses(initialResponses);
      }
    } catch (error) {
      console.error("Failed to load form config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePreview = async () => {
    try {
      const responsesArray = Object.values(responses);
      const response = await fetch(
        new URL('/api/institutional-inspections/calculate-score', getApiUrl()).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses: responsesArray }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setScorePreview({
          totalScore: data.totalScore,
          riskClassification: data.riskClassification,
        });
      }
    } catch (error) {
      console.error("Preview error:", error);
    }
  };

  const handleResponseChange = (indicatorId: string, value: 'yes' | 'no' | 'na') => {
    setResponses(prev => ({
      ...prev,
      [indicatorId]: { indicatorId, response: value },
    }));
  };

  const handleCaptureImage = async (indicatorId: string) => {
    const existingImages = indicatorImages[indicatorId] || [];
    if (existingImages.length >= 3) {
      Alert.alert("Limit Reached", "Maximum 3 images per indicator.");
      return;
    }

    if (!currentLocation) {
      Alert.alert("Location Required", "Please wait for location to be captured.");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission Required", "Please enable camera access in settings.");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 0.8,
        exif: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const capturedAt = new Date();
      const uploadedAt = new Date();

      let imageLat = currentLocation.latitude;
      let imageLng = currentLocation.longitude;

      if (asset.exif?.GPSLatitude && asset.exif?.GPSLongitude) {
        imageLat = String(asset.exif.GPSLatitude);
        imageLng = String(asset.exif.GPSLongitude);
      }

      const metadata: ImageMetadata = {
        capturedAt,
        uploadedAt,
        latitude: imageLat,
        longitude: imageLng,
      };

      const newImage: EvidenceImage = {
        id: generateUniqueId(),
        uri: asset.uri,
        metadata,
      };

      if (!viewShotRefs.current[newImage.id]) {
        viewShotRefs.current[newImage.id] = React.createRef<ViewShot | null>();
      }

      setIndicatorImages(prev => ({
        ...prev,
        [indicatorId]: [...(prev[indicatorId] || []), newImage],
      }));
    } catch (error) {
      console.error("Capture error:", error);
      Alert.alert("Error", "Failed to capture image.");
    }
  };

  const handleRemoveImage = (indicatorId: string, imageId: string) => {
    setIndicatorImages(prev => ({
      ...prev,
      [indicatorId]: (prev[indicatorId] || []).filter(img => img.id !== imageId),
    }));
  };

  const captureAllWatermarkedImages = async (): Promise<Record<string, string[]>> => {
    const result: Record<string, string[]> = {};
    
    for (const [indicatorId, images] of Object.entries(indicatorImages)) {
      const capturedUris: string[] = [];
      for (const image of images) {
        const vsRef = viewShotRefs.current[image.id];
        if (vsRef?.current?.capture) {
          try {
            const uri = await vsRef.current.capture();
            capturedUris.push(uri);
          } catch {
            capturedUris.push(image.uri);
          }
        } else {
          capturedUris.push(image.uri);
        }
      }
      if (capturedUris.length > 0) {
        result[indicatorId] = capturedUris;
      }
    }
    
    return result;
  };

  const handleDownloadReport = async (inspectionId: string) => {
    try {
      const reportUrl = new URL(`/api/institutional-inspections/${inspectionId}/report`, getApiUrl()).toString();
      const { openBrowserAsync } = await import('expo-web-browser');
      await openBrowserAsync(reportUrl);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!institutionName.trim()) {
      Alert.alert("Required", "Please enter institution name");
      return;
    }

    setIsSubmitting(true);

    try {
      const watermarkedImages = await captureAllWatermarkedImages();

      const createResponse = await fetch(
        new URL('/api/institutional-inspections', getApiUrl()).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            institutionName,
            institutionAddress,
            jurisdictionId: user?.jurisdiction?.unitId,
            districtId: user?.jurisdiction?.unitId,
            inspectionDate: new Date().toISOString(),
            officerId: user?.id,
            latitude: currentLocation?.latitude,
            longitude: currentLocation?.longitude,
          }),
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create inspection');
      }

      const inspection = await createResponse.json();
      
      const responsesArray = Object.values(responses).map(r => ({
        ...r,
        images: watermarkedImages[r.indicatorId] || [],
      }));
      
      await fetch(
        new URL(`/api/institutional-inspections/${inspection.id}/responses`, getApiUrl()).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses: responsesArray, officerId: user?.id }),
        }
      );

      await fetch(
        new URL(`/api/institutional-inspections/${inspection.id}/submit`, getApiUrl()).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ officerId: user?.id }),
        }
      );

      Alert.alert(
        "Assessment Complete",
        `Safety Classification: ${scorePreview?.riskClassification?.toUpperCase()}\nSafety Score: ${scorePreview?.totalScore}`,
        [
          {
            text: "Download PDF Report",
            onPress: () => handleDownloadReport(inspection.id),
          },
          {
            text: "New Assessment",
            onPress: () => resetForm(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Submit error:", error);
      Alert.alert("Error", error.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setInstitutionName("");
    setInstitutionAddress("");
    setIndicatorImages({});
    const initialResponses: Record<string, IndicatorResponse> = {};
    pillars.forEach((pillar: Pillar) => {
      pillar.indicators.forEach((ind: Indicator) => {
        initialResponses[ind.id] = { indicatorId: ind.id, response: 'yes' };
      });
    });
    setResponses(initialResponses);
  };

  const renderWatermarkedImage = (image: EvidenceImage, indicatorId: string) => {
    const inspectionInfo: InspectionInfo = {
      institutionName,
      institutionAddress,
    };
    const watermarkLines = generateWatermarkLines(image.metadata, {
      complainantName: institutionName,
      establishmentName: institutionAddress,
    });

    if (!viewShotRefs.current[image.id]) {
      viewShotRefs.current[image.id] = React.createRef<ViewShot | null>();
    }

    return (
      <View key={image.id} style={styles.imageWrapper}>
        <ViewShot
          ref={viewShotRefs.current[image.id]}
          options={{ format: "jpg", quality: 0.9 }}
          style={styles.viewShot}
        >
          <Image source={{ uri: image.uri }} style={styles.capturedImage} contentFit="cover" />
          <View style={styles.watermarkContainer}>
            {watermarkLines.map((line, index) => (
              <ThemedText
                key={index}
                style={[styles.watermarkText, index === watermarkLines.length - 1 && styles.gpsText]}
              >
                {line}
              </ThemedText>
            ))}
          </View>
        </ViewShot>
        <Pressable
          style={styles.removeImageBtn}
          onPress={() => handleRemoveImage(indicatorId, image.id)}
        >
          <Feather name="x" size={14} color="white" />
        </Pressable>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: Spacing.md }}>Loading safety assessment...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.scoreHeader, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <View style={styles.scoreRow}>
          <ThemedText style={styles.scoreLabel}>Safety Score:</ThemedText>
          <ThemedText style={[styles.scoreValue, { color: theme.primary }]}>
            {scorePreview?.totalScore ?? 0}
          </ThemedText>
        </View>
        <View style={[
          styles.classificationBadge,
          scorePreview?.riskClassification ? { 
            backgroundColor: RISK_COLORS[scorePreview.riskClassification as keyof typeof RISK_COLORS]?.bg 
          } : { backgroundColor: '#E5E7EB' }
        ]}>
          <ThemedText style={[
            styles.classificationText,
            scorePreview?.riskClassification ? {
              color: RISK_COLORS[scorePreview.riskClassification as keyof typeof RISK_COLORS]?.text
            } : { color: '#6B7280' }
          ]}>
            {scorePreview?.riskClassification?.toUpperCase() || 'PENDING'}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.institutionCard}>
          <ThemedText style={styles.sectionTitle}>Institution Details</ThemedText>
          <Input
            label="Institution Name *"
            placeholder="Enter institution name"
            value={institutionName}
            onChangeText={setInstitutionName}
            style={styles.input}
          />
          <Input
            label="Address"
            placeholder="Enter address"
            value={institutionAddress}
            onChangeText={setInstitutionAddress}
            style={styles.input}
          />
          <View style={styles.locationRow}>
            <Feather 
              name={currentLocation ? "check-circle" : "map-pin"} 
              size={16} 
              color={currentLocation ? "#059669" : theme.textSecondary} 
            />
            <ThemedText style={[styles.locationText, { color: currentLocation ? "#059669" : theme.textSecondary }]}>
              {isGettingLocation ? "Getting location..." : 
               currentLocation ? `GPS: ${parseFloat(currentLocation.latitude).toFixed(6)}, ${parseFloat(currentLocation.longitude).toFixed(6)}` :
               "Location not available"}
            </ThemedText>
          </View>
        </Card>

        {pillars.map((pillar) => (
          <View key={pillar.id} style={styles.pillarSection}>
            <View style={[styles.pillarHeader, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.pillarNumber}>{pillar.pillarNumber}</ThemedText>
              <ThemedText style={styles.pillarName}>{pillar.name}</ThemedText>
            </View>

            {pillar.indicators.map((indicator) => {
              const currentResponse = responses[indicator.id]?.response || 'yes';
              const riskColors = RISK_COLORS[indicator.riskLevel];
              const images = indicatorImages[indicator.id] || [];

              return (
                <Card key={indicator.id} style={styles.indicatorCard}>
                  <View style={styles.indicatorHeader}>
                    <ThemedText style={styles.indicatorNumber}>
                      {pillar.pillarNumber}.{indicator.indicatorNumber}
                    </ThemedText>
                    <View style={[styles.riskBadge, { backgroundColor: riskColors.bg }]}>
                      <ThemedText style={[styles.riskBadgeText, { color: riskColors.text }]}>
                        {indicator.riskLevel.toUpperCase()} ({indicator.weight})
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.indicatorName}>{indicator.name}</ThemedText>

                  <View style={styles.responseButtons}>
                    {(['yes', 'no', 'na'] as const).map((value) => {
                      const isSelected = currentResponse === value;
                      const btnStyle = isSelected ? (
                        value === 'yes' ? styles.yesSelected :
                        value === 'no' ? styles.noSelected :
                        styles.naSelected
                      ) : styles.responseBtn;

                      return (
                        <Pressable
                          key={value}
                          style={[styles.responseBtn, isSelected && btnStyle]}
                          onPress={() => handleResponseChange(indicator.id, value)}
                        >
                          <ThemedText style={[
                            styles.responseBtnText,
                            isSelected && value === 'yes' && { color: '#059669' },
                            isSelected && value === 'no' && { color: '#DC2626' },
                            isSelected && value === 'na' && { color: '#6B7280' },
                          ]}>
                            {value.toUpperCase()}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>

                  {images.length > 0 ? (
                    <View style={styles.imagesRow}>
                      {images.map(img => renderWatermarkedImage(img, indicator.id))}
                    </View>
                  ) : null}

                  <Pressable
                    style={[styles.cameraBtn, { borderColor: theme.primary }]}
                    onPress={() => handleCaptureImage(indicator.id)}
                    disabled={images.length >= 3}
                  >
                    <Feather name="camera" size={16} color={theme.primary} />
                    <ThemedText style={[styles.cameraBtnText, { color: theme.primary }]}>
                      {images.length > 0 ? `Add Photo (${images.length}/3)` : "Add Photo"}
                    </ThemedText>
                  </Pressable>
                </Card>
              );
            })}
          </View>
        ))}

        <View style={styles.submitSection}>
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit & Generate PDF Report"}
          </Button>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreLabel: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  classificationBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  classificationText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  institutionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  locationText: {
    fontSize: FontSize.sm,
  },
  pillarSection: {
    marginBottom: Spacing.lg,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  pillarNumber: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 28,
    height: 28,
    textAlign: 'center',
    lineHeight: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
  },
  pillarName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  indicatorCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  indicatorNumber: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: '#6B7280',
  },
  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  indicatorName: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  responseBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  yesSelected: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  noSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  naSelected: {
    backgroundColor: '#E5E7EB',
    borderColor: '#6B7280',
  },
  responseBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: '#6B7280',
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  imageWrapper: {
    width: 100,
    height: 75,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  viewShot: {
    flex: 1,
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    maxWidth: '70%',
  },
  watermarkText: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontSize: 5,
    color: '#ffffff',
    lineHeight: 7,
  },
  gpsText: {
    color: '#90EE90',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  cameraBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  submitSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
