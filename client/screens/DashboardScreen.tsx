import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { StatCardSkeleton } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/context/AuthContext';
import { getApiUrl, apiRequest } from '@/lib/query-client';
import { DashboardMetrics, ProsecutionCase } from '@/types';
import { Spacing, BorderRadius } from '@/constants/theme';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  onPress?: () => void;
}

function MetricCard({ title, value, subtitle, icon, color, onPress }: MetricCardProps) {
  const { theme } = useTheme();
  
  return (
    <Pressable onPress={onPress} style={styles.metricCard}>
      <Card style={styles.cardInner}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Feather name={icon} size={20} color={color} />
        </View>
        <ThemedText type="h2" style={styles.metricValue}>{value}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2, fontSize: 11 }}>{subtitle}</ThemedText>
        ) : null}
      </Card>
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
}

function SectionHeader({ title, icon }: SectionHeaderProps) {
  const { theme } = useTheme();
  
  return (
    <View style={styles.sectionHeader}>
      <Feather name={icon} size={18} color={theme.primary} />
      <ThemedText type="h3" style={{ marginLeft: Spacing.sm }}>{title}</ThemedText>
    </View>
  );
}

interface CourtCaseCardProps {
  caseData: ProsecutionCase;
  onPress: () => void;
}

function CourtCaseCard({ caseData, onPress }: CourtCaseCardProps) {
  const { theme } = useTheme();
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysUntilHearing = () => {
    if (!caseData.nextHearingDate) return null;
    const next = new Date(caseData.nextHearingDate);
    const today = new Date();
    const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntil = getDaysUntilHearing();
  const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
  const isPast = daysUntil !== null && daysUntil < 0;

  const cardStyle = {
    ...styles.caseCard,
    ...(isUrgent ? { borderLeftWidth: 3, borderLeftColor: theme.warning } : {}),
    ...(isPast ? { borderLeftWidth: 3, borderLeftColor: theme.accent } : {}),
  };
  
  return (
    <Pressable onPress={onPress}>
      <Card style={cardStyle}>
        <View style={styles.caseHeader}>
          <View style={styles.caseNumberBadge}>
            <Feather name="briefcase" size={14} color={theme.primary} />
            <ThemedText type="body" style={{ marginLeft: 6, fontWeight: '600' }}>{caseData.caseNumber}</ThemedText>
          </View>
          {daysUntil !== null ? (
            <View style={[styles.daysBadge, { backgroundColor: isPast ? theme.accent + '20' : isUrgent ? theme.warning + '20' : theme.success + '20' }]}>
              <ThemedText type="small" style={{ color: isPast ? theme.accent : isUrgent ? theme.warning : theme.success, fontSize: 11 }}>
                {isPast ? `${Math.abs(daysUntil)} days ago` : daysUntil === 0 ? 'Today' : `${daysUntil} days`}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.caseDetails}>
          <View style={styles.caseRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary, width: 90 }}>Respondent</ThemedText>
            <ThemedText type="body" style={{ flex: 1 }}>{caseData.respondentName}</ThemedText>
          </View>
          <View style={styles.caseRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary, width: 90 }}>Complainant</ThemedText>
            <ThemedText type="body" style={{ flex: 1 }}>{caseData.complainantName}</ThemedText>
          </View>
          {caseData.courtName ? (
            <View style={styles.caseRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary, width: 90 }}>Court</ThemedText>
              <ThemedText type="body" style={{ flex: 1 }}>{caseData.courtName}</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.caseDates}>
          <View style={styles.dateItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10 }}>First Reg.</ThemedText>
            <ThemedText type="small">{formatDate(caseData.firstRegistrationDate)}</ThemedText>
          </View>
          <View style={styles.dateItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10 }}>First Hearing</ThemedText>
            <ThemedText type="small">{formatDate(caseData.firstHearingDate)}</ThemedText>
          </View>
          <View style={styles.dateItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10 }}>Next Hearing</ThemedText>
            <ThemedText type="small" style={{ color: isUrgent ? theme.warning : isPast ? theme.accent : theme.text }}>
              {formatDate(caseData.nextHearingDate)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.caseFooter}>
          <Feather name="chevron-right" size={16} color={theme.textSecondary} />
        </View>
      </Card>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [upcomingCases, setUpcomingCases] = useState<ProsecutionCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const jurisdictionId = user?.jurisdiction?.unitId;

  const loadData = useCallback(async () => {
    try {
      const metricsUrl = new URL('/api/dashboard/metrics', getApiUrl());
      if (jurisdictionId) {
        metricsUrl.searchParams.set('jurisdictionId', jurisdictionId);
      }

      const casesUrl = new URL('/api/upcoming-hearings', getApiUrl());
      if (jurisdictionId) {
        casesUrl.searchParams.set('jurisdictionId', jurisdictionId);
      }
      casesUrl.searchParams.set('days', '30');

      const [metricsRes, casesRes] = await Promise.all([
        fetch(metricsUrl.toString()),
        fetch(casesUrl.toString()),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setUpcomingCases(casesData.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [jurisdictionId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)} K`;
    return amount.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Welcome back,
          </ThemedText>
          <ThemedText type="h2">{user?.name || 'Officer'}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            {user?.designation}{user?.jurisdiction?.unitName ? ` - ${user.jurisdiction.unitName}` : ''}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader title="Licenses & Registrations" icon="file-text" />
          {isLoading ? (
            <View style={styles.metricsRow}>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </View>
          ) : (
            <>
              <View style={styles.metricsRow}>
                <MetricCard
                  title="Licenses"
                  value={metrics?.licenses.total || 0}
                  subtitle={`Active: ${metrics?.licenses.active || 0}`}
                  icon="award"
                  color={theme.primary}
                />
                <MetricCard
                  title="License Fees"
                  value={`Rs ${formatAmount(metrics?.licenses.amount || 0)}`}
                  icon="dollar-sign"
                  color={theme.success}
                />
              </View>
              <View style={styles.metricsRow}>
                <MetricCard
                  title="Registrations"
                  value={metrics?.registrations.total || 0}
                  subtitle={`Active: ${metrics?.registrations.active || 0}`}
                  icon="file"
                  color="#0EA5E9"
                />
                <MetricCard
                  title="Reg. Fees"
                  value={`Rs ${formatAmount(metrics?.registrations.amount || 0)}`}
                  icon="dollar-sign"
                  color={theme.success}
                />
              </View>
            </>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <SectionHeader title="Inspections" icon="clipboard" />
          {isLoading ? (
            <View style={styles.metricsRow}>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </View>
          ) : (
            <View style={styles.metricsRow}>
              <MetricCard
                title="License Insp."
                value={metrics?.inspections.license || 0}
                icon="search"
                color={theme.primary}
                onPress={() => navigation.navigate('InspectionsTab')}
              />
              <MetricCard
                title="Reg. Insp."
                value={metrics?.inspections.registration || 0}
                icon="search"
                color="#0EA5E9"
                onPress={() => navigation.navigate('InspectionsTab')}
              />
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <SectionHeader title="Grievances" icon="message-square" />
          {isLoading ? (
            <View style={styles.metricsRow}>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </View>
          ) : (
            <View style={styles.metricsRow}>
              <MetricCard
                title="Online"
                value={metrics?.grievances.online || 0}
                icon="globe"
                color="#3B82F6"
              />
              <MetricCard
                title="Offline"
                value={metrics?.grievances.offline || 0}
                icon="edit-3"
                color="#8B5CF6"
              />
              <MetricCard
                title="Pending"
                value={metrics?.grievances.pending || 0}
                icon="clock"
                color={theme.warning}
              />
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <SectionHeader title="FSW Activities" icon="users" />
          {isLoading ? (
            <View style={styles.metricsRow}>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </View>
          ) : (
            <View style={styles.metricsRow}>
              <MetricCard
                title="Testing"
                value={metrics?.fsw.testing || 0}
                icon="thermometer"
                color="#10B981"
              />
              <MetricCard
                title="Training"
                value={metrics?.fsw.training || 0}
                icon="book-open"
                color="#F59E0B"
              />
              <MetricCard
                title="Awareness"
                value={metrics?.fsw.awareness || 0}
                icon="radio"
                color="#EC4899"
              />
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <SectionHeader title="Adjudication & Prosecution" icon="briefcase" />
          {isLoading ? (
            <View style={styles.metricsRow}>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </View>
          ) : (
            <View style={styles.metricsRow}>
              <MetricCard
                title="Adj. Pending"
                value={metrics?.adjudication.pending || 0}
                subtitle={`Total: ${metrics?.adjudication.total || 0}`}
                icon="sliders"
                color="#6366F1"
              />
              <MetricCard
                title="Court Pending"
                value={metrics?.prosecution.pending || 0}
                subtitle={`Total: ${metrics?.prosecution.total || 0}`}
                icon="briefcase"
                color={theme.accent}
                onPress={() => navigation.navigate('ProfileTab', { screen: 'CourtCases' })}
              />
            </View>
          )}
        </Animated.View>

        {upcomingCases.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(700).duration(400)}>
            <View style={styles.sectionHeaderWithAction}>
              <SectionHeader title="Upcoming Court Dates" icon="calendar" />
              <Pressable 
                onPress={() => navigation.navigate('ProfileTab', { screen: 'CourtCases' })}
                style={styles.viewAllButton}
              >
                <ThemedText type="small" style={{ color: theme.primary }}>View All</ThemedText>
                <Feather name="chevron-right" size={14} color={theme.primary} />
              </Pressable>
            </View>
            {upcomingCases.map((caseData, index) => (
              <Animated.View key={caseData.id} entering={FadeInDown.delay(750 + index * 50).duration(400)}>
                <CourtCaseCard
                  caseData={caseData}
                  onPress={() => navigation.navigate('ProfileTab', { screen: 'CaseDetails', params: { caseId: caseData.id } })}
                />
              </Animated.View>
            ))}
          </Animated.View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
  },
  cardInner: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  metricValue: {
    fontSize: 22,
    marginBottom: 2,
  },
  caseCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  caseNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  caseDetails: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  caseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  caseDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  dateItem: {
    alignItems: 'center',
  },
  caseFooter: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
  },
});
