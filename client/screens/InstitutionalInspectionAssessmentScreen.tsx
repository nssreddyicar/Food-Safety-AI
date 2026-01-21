import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
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
  remarks?: string;
}

type RouteParams = {
  InstitutionalInspectionAssessment: { inspectionId: string };
};

const RISK_COLORS = {
  high: { bg: '#FEE2E2', text: '#DC2626', border: '#F87171' },
  medium: { bg: '#FEF3C7', text: '#D97706', border: '#FBBF24' },
  low: { bg: '#D1FAE5', text: '#059669', border: '#34D399' },
};

export default function InstitutionalInspectionAssessmentScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'InstitutionalInspectionAssessment'>>();
  const { token, user } = useAuthContext();
  const { inspectionId } = route.params;

  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [responses, setResponses] = useState<Record<string, IndicatorResponse>>({});
  const [expandedPillar, setExpandedPillar] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorePreview, setScorePreview] = useState<{
    totalScore: number;
    riskClassification: string;
    highRiskCount: number;
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
          highRiskCount: data.highRiskCount,
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const responsesArray = Object.values(responses);
      
      const responseResult = await fetch(
        new URL(`/api/institutional-inspections/${inspectionId}/responses`, getApiUrl()).toString(),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
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
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ officerId: user?.id }),
        }
      );

      if (submitResult.ok) {
        Alert.alert(
          "Assessment Complete",
          `Risk Classification: ${scorePreview?.riskClassification?.toUpperCase()}\nTotal Score: ${scorePreview?.totalScore}`,
          [
            {
              text: "Done",
              onPress: () => navigation.popToTop(),
            },
          ]
        );
      } else {
        const error = await submitResult.json();
        Alert.alert("Error", error.error || "Failed to submit inspection");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      Alert.alert("Error", error.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompletionStatus = () => {
    const total = pillars.reduce((sum, p) => sum + p.indicators.length, 0);
    const answered = Object.keys(responses).length;
    return { answered, total };
  };

  const renderIndicator = (indicator: Indicator, pillarId: string) => {
    const currentResponse = responses[indicator.id]?.response || 'yes';
    const colors = RISK_COLORS[indicator.riskLevel];

    return (
      <View key={indicator.id} style={styles.indicatorRow}>
        <View style={styles.indicatorInfo}>
          <View style={styles.indicatorHeader}>
            <ThemedText style={styles.indicatorNumber}>
              {indicator.indicatorNumber}.
            </ThemedText>
            <View style={[styles.riskBadge, { backgroundColor: colors.bg }]}>
              <ThemedText style={[styles.riskBadgeText, { color: colors.text }]}>
                {indicator.riskLevel.toUpperCase()} ({indicator.weight})
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.indicatorName}>{indicator.name}</ThemedText>
        </View>

        <View style={styles.responseButtons}>
          {(['yes', 'no', 'na'] as const).map((value) => (
            <Pressable
              key={value}
              style={[
                styles.responseBtn,
                currentResponse === value && styles.responseBtnActive,
                currentResponse === value && value === 'yes' && { backgroundColor: '#D1FAE5', borderColor: '#059669' },
                currentResponse === value && value === 'no' && { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
                currentResponse === value && value === 'na' && { backgroundColor: '#E5E7EB', borderColor: '#6B7280' },
              ]}
              onPress={() => handleResponseChange(indicator.id, value)}
            >
              <ThemedText style={[
                styles.responseBtnText,
                currentResponse === value && value === 'yes' && { color: '#059669' },
                currentResponse === value && value === 'no' && { color: '#DC2626' },
                currentResponse === value && value === 'na' && { color: '#6B7280' },
              ]}>
                {value.toUpperCase()}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const { answered, total } = getCompletionStatus();

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading assessment form...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.scorePreview}>
          <ThemedText style={styles.scoreLabel}>Risk Score</ThemedText>
          <ThemedText style={[styles.scoreValue, { color: theme.primary }]}>
            {scorePreview?.totalScore ?? 0}
          </ThemedText>
        </View>
        <View style={[
          styles.riskClassification,
          scorePreview?.riskClassification && { 
            backgroundColor: RISK_COLORS[scorePreview.riskClassification as keyof typeof RISK_COLORS]?.bg 
          }
        ]}>
          <ThemedText style={[
            styles.riskText,
            scorePreview?.riskClassification && {
              color: RISK_COLORS[scorePreview.riskClassification as keyof typeof RISK_COLORS]?.text
            }
          ]}>
            {scorePreview?.riskClassification?.toUpperCase() || 'PENDING'}
          </ThemedText>
        </View>
        <View style={styles.progress}>
          <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
            {answered}/{total} answered
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {pillars.map((pillar, index) => (
          <Animated.View
            key={pillar.id}
            entering={FadeInDown.delay(index * 50).duration(300)}
          >
            <Card style={styles.pillarCard}>
              <Pressable
                style={styles.pillarHeader}
                onPress={() => setExpandedPillar(expandedPillar === index ? null : index)}
              >
                <View>
                  <ThemedText style={[styles.pillarNumber, { color: theme.primary }]}>
                    Pillar {pillar.pillarNumber}
                  </ThemedText>
                  <ThemedText style={styles.pillarName}>{pillar.name}</ThemedText>
                </View>
                <Feather
                  name={expandedPillar === index ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={theme.textSecondary}
                />
              </Pressable>

              {expandedPillar === index && (
                <View style={styles.indicatorsList}>
                  {pillar.indicators.map((ind) => renderIndicator(ind, pillar.id))}
                </View>
              )}
            </Card>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          title={isSubmitting ? "Submitting..." : "Submit Assessment"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  scorePreview: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: FontSize.xs,
    color: '#6B7280',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  riskClassification: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  riskText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#6B7280',
  },
  progress: {},
  progressText: {
    fontSize: FontSize.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  pillarCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  pillarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  pillarNumber: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  pillarName: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  indicatorsList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  indicatorRow: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  indicatorInfo: {
    marginBottom: Spacing.sm,
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  indicatorNumber: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  indicatorName: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  responseBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  responseBtnActive: {
    borderWidth: 2,
  },
  responseBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: '#6B7280',
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
