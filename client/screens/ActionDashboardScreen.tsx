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
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/query-client';
import { ActionDashboardData, ActionCategory, ActionCategoryGroup } from '@/types';
import { Spacing, BorderRadius } from '@/constants/theme';

const GROUP_INFO: Record<ActionCategoryGroup, { name: string; icon: keyof typeof Feather.glyphMap; color: string }> = {
  legal: { name: 'Legal & Court', icon: 'briefcase', color: '#DC2626' },
  inspection: { name: 'Inspections & Enforcement', icon: 'clipboard', color: '#1E40AF' },
  sampling: { name: 'Sampling & Laboratory', icon: 'thermometer', color: '#059669' },
  administrative: { name: 'Administrative', icon: 'file-text', color: '#7C3AED' },
  protocol: { name: 'Protocol & Duties', icon: 'shield', color: '#D97706' },
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
}

function SummaryCard({ title, value, icon, color, bgColor }: SummaryCardProps) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bgColor }]}>
      <Feather name={icon} size={20} color={color} />
      <ThemedText type="h2" style={{ color, marginTop: Spacing.xs }}>{value}</ThemedText>
      <ThemedText type="small" style={{ color, fontSize: 11 }}>{title}</ThemedText>
    </View>
  );
}

interface CategoryCardProps {
  category: ActionCategory;
  onPress: () => void;
}

function CategoryCard({ category, onPress }: CategoryCardProps) {
  const { theme } = useTheme();
  const hasOverdue = category.counts.overdue > 0;
  const hasDueToday = category.counts.dueToday > 0;
  
  const getFeatherIcon = (iconName: string): keyof typeof Feather.glyphMap => {
    const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
      'briefcase': 'briefcase',
      'file-text': 'file-text',
      'dollar-sign': 'dollar-sign',
      'refresh-cw': 'refresh-cw',
      'clipboard': 'clipboard',
      'alert-triangle': 'alert-triangle',
      'lock': 'lock',
      'trash-2': 'trash-2',
      'package': 'package',
      'clock': 'clock',
      'file-plus': 'file-plus',
      'alert-octagon': 'alert-octagon',
      'alert-circle': 'alert-circle',
      'tag': 'tag',
      'shield-off': 'shield-off',
      'target': 'target',
      'users': 'users',
      'calendar': 'calendar',
      'star': 'star',
      'message-circle': 'message-circle',
      'shield': 'shield',
    };
    return iconMap[iconName] || 'folder';
  };

  const cardStyle = hasOverdue 
    ? { ...styles.categoryCard, ...styles.categoryCardUrgent } 
    : styles.categoryCard;

  return (
    <Card style={cardStyle} onPress={onPress}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '15' }]}>
          <Feather name={getFeatherIcon(category.icon)} size={20} color={category.color} />
        </View>
        <View style={styles.categoryInfo}>
          <ThemedText type="body" style={styles.categoryName}>{category.name}</ThemedText>
          <View style={styles.categoryMeta}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {category.counts.pending} pending
            </ThemedText>
            {hasOverdue ? (
              <View style={[styles.badge, { backgroundColor: theme.accent + '20' }]}>
                <ThemedText type="small" style={{ color: theme.accent, fontSize: 10 }}>
                  {category.counts.overdue} overdue
                </ThemedText>
              </View>
            ) : null}
            {hasDueToday && !hasOverdue ? (
              <View style={[styles.badge, { backgroundColor: theme.warning + '20' }]}>
                <ThemedText type="small" style={{ color: theme.warning, fontSize: 10 }}>
                  {category.counts.dueToday} today
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.countContainer}>
          <ThemedText type="h2" style={{ color: hasOverdue ? theme.accent : theme.text }}>
            {category.counts.total}
          </ThemedText>
        </View>
      </View>
      {category.priority === 'critical' ? (
        <View style={[styles.priorityIndicator, { backgroundColor: theme.accent }]} />
      ) : category.priority === 'high' ? (
        <View style={[styles.priorityIndicator, { backgroundColor: theme.warning }]} />
      ) : null}
    </Card>
  );
}

export default function ActionDashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();

  const [data, setData] = useState<ActionDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const jurisdictionId = user?.jurisdiction?.unitId;

  const loadData = useCallback(async () => {
    try {
      const url = new URL('/api/action-dashboard', getApiUrl());
      if (jurisdictionId) {
        url.searchParams.set('jurisdictionId', jurisdictionId);
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Failed to load action dashboard:', error);
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

  const handleCategoryPress = (category: ActionCategory) => {
    switch (category.code) {
      case 'court_cases':
        navigation.navigate('ProfileTab', { screen: 'CourtCases' });
        break;
      case 'pending_inspections':
        navigation.navigate('InspectionsTab');
        break;
      case 'samples_pending':
      case 'lab_reports_awaited':
      case 'unsafe_samples':
      case 'substandard_samples':
        navigation.navigate('SamplesTab');
        break;
      default:
        break;
    }
  };

  const groupedCategories: Partial<Record<ActionCategoryGroup, ActionCategory[]>> = {};
  if (data?.categories) {
    data.categories.forEach((cat) => {
      if (!groupedCategories[cat.group]) {
        groupedCategories[cat.group] = [];
      }
      groupedCategories[cat.group]!.push(cat);
    });
  }

  const groupOrder: ActionCategoryGroup[] = ['legal', 'inspection', 'sampling', 'administrative', 'protocol'];

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
          <ThemedText type="h2">Action Dashboard</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            {user?.jurisdiction?.unitName || 'All Jurisdictions'}
          </ThemedText>
        </Animated.View>

        {data ? (
          <>
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <View style={styles.summaryRow}>
                <SummaryCard
                  title="Overdue"
                  value={data.totals.overdueItems}
                  icon="alert-circle"
                  color="#DC2626"
                  bgColor="#FEE2E2"
                />
                <SummaryCard
                  title="Due Today"
                  value={data.totals.dueToday}
                  icon="clock"
                  color="#D97706"
                  bgColor="#FEF3C7"
                />
                <SummaryCard
                  title="This Week"
                  value={data.totals.dueThisWeek}
                  icon="calendar"
                  color="#1E40AF"
                  bgColor="#DBEAFE"
                />
                <SummaryCard
                  title="Total"
                  value={data.totals.totalItems}
                  icon="layers"
                  color="#059669"
                  bgColor="#D1FAE5"
                />
              </View>
            </Animated.View>

            {groupOrder.map((group, groupIndex) => {
              const categories = groupedCategories[group];
              if (!categories || categories.length === 0) return null;

              const groupInfo = GROUP_INFO[group];
              return (
                <Animated.View 
                  key={group} 
                  entering={FadeInDown.delay(300 + groupIndex * 100).duration(400)}
                >
                  <View style={styles.groupHeader}>
                    <View style={[styles.groupIcon, { backgroundColor: groupInfo.color + '15' }]}>
                      <Feather name={groupInfo.icon} size={16} color={groupInfo.color} />
                    </View>
                    <ThemedText type="h3" style={{ color: theme.textSecondary }}>
                      {groupInfo.name}
                    </ThemedText>
                  </View>
                  {categories.map((category, catIndex) => (
                    <Animated.View 
                      key={category.id}
                      entering={FadeInDown.delay(350 + groupIndex * 100 + catIndex * 50).duration(400)}
                    >
                      <CategoryCard
                        category={category}
                        onPress={() => handleCategoryPress(category)}
                      />
                    </Animated.View>
                  ))}
                </Animated.View>
              );
            })}
          </>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Loading action dashboard...
            </ThemedText>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
              No action categories configured
            </ThemedText>
          </View>
        )}
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
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  groupIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCard: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  categoryCardUrgent: {
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: '600',
    fontSize: 15,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countContainer: {
    alignItems: 'flex-end',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.xl * 2,
    alignItems: 'center',
  },
});
