import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { StatusBadge } from '@/components/StatusBadge';
import { useTheme } from '@/hooks/useTheme';
import { storage } from '@/lib/storage';
import { Sample } from '@/types';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

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

export default function SampleDetailsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<RouteProp<RouteParams, 'SampleDetails'>>();
  
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSample();
  }, []);

  const loadSample = async () => {
    try {
      const samples = await storage.getSamples();
      const found = samples.find((s) => s.id === route.params.sampleId);
      setSample(found || null);
    } catch (error) {
      console.error('Failed to load sample:', error);
    } finally {
      setIsLoading(false);
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
});
