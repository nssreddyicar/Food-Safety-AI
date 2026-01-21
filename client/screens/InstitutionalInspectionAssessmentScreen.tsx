import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuthContext } from "@/context/AuthContext";
import { Spacing, FontSize } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

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
}

type RouteParams = {
  InstitutionalInspectionAssessment: { inspectionId: string };
};

const RISK_COLORS = {
  high: { bg: '#FEE2E2', text: '#DC2626' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  low: { bg: '#D1FAE5', text: '#059669' },
};

export default function InstitutionalInspectionAssessmentScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'InstitutionalInspectionAssessment'>>();
  const { user } = useAuthContext();
  const { inspectionId } = route.params;

  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [responses, setResponses] = useState<Record<string, IndicatorResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorePreview, setScorePreview] = useState<{
    totalScore: number;
    riskClassification: string;
  } | null>(null);

  useEffect(() => {
    loadFormConfig();
  }, []);

  useEffect(() => {
    if (pillars.length > 0 && Object.keys(responses).length > 0) {
      calculatePreview();
    }
  }, [responses]);

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

  const handleDownloadReport = async () => {
    try {
      const reportUrl = new URL(`/api/institutional-inspections/${inspectionId}/report`, getApiUrl()).toString();
      const { openBrowserAsync } = await import('expo-web-browser');
      await openBrowserAsync(reportUrl);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const responsesArray = Object.values(responses);
      
      const responseResult = await fetch(
        new URL(`/api/institutional-inspections/${inspectionId}/responses`, getApiUrl()).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses: responsesArray, officerId: user?.id }),
        }
      );

      if (!responseResult.ok) {
        const error = await responseResult.json();
        throw new Error(error.error || 'Failed to submit responses');
      }

      const submitResult = await fetch(
        new URL(`/api/institutional-inspections/${inspectionId}/submit`, getApiUrl()).toString(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ officerId: user?.id }),
        }
      );

      if (submitResult.ok) {
        Alert.alert(
          "Assessment Complete",
          `Safety Classification: ${scorePreview?.riskClassification?.toUpperCase()}\nSafety Score: ${scorePreview?.totalScore}`,
          [
            {
              text: "Download PDF Report",
              onPress: () => {
                handleDownloadReport();
                navigation.popToTop();
              },
            },
            {
              text: "Done",
              onPress: () => navigation.popToTop(),
            },
          ]
        );
      } else {
        const error = await submitResult.json();
        Alert.alert("Error", error.error || "Failed to submit");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      Alert.alert("Error", error.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
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
        {pillars.map((pillar) => (
          <View key={pillar.id} style={styles.pillarSection}>
            <View style={[styles.pillarHeader, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.pillarNumber}>{pillar.pillarNumber}</ThemedText>
              <ThemedText style={styles.pillarName}>{pillar.name}</ThemedText>
            </View>

            {pillar.indicators.map((indicator) => {
              const currentResponse = responses[indicator.id]?.response || 'yes';
              const riskColors = RISK_COLORS[indicator.riskLevel];

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
            {isSubmitting ? "Submitting..." : "Submit Assessment & Generate PDF"}
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
  submitSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
