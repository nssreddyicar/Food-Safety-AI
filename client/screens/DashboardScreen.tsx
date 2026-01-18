import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { StatCard } from '@/components/StatCard';
import { UrgentActionCard } from '@/components/UrgentActionCard';
import { EmptyState } from '@/components/EmptyState';
import { StatCardSkeleton } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/context/AuthContext';
import { storage } from '@/lib/storage';
import { DashboardStats, UrgentAction } from '@/types';
import { Spacing, Shadows, BorderRadius } from '@/constants/theme';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [urgentActions, setUrgentActions] = useState<UrgentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, actionsData] = await Promise.all([
        storage.getDashboardStats(),
        storage.getUrgentActions(),
      ]);
      setStats(statsData);
      setUrgentActions(actionsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Welcome back,
        </ThemedText>
        <ThemedText type="h2">{user?.name || 'Officer'}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          {user?.designation} - {user?.district}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsContainer}>
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Pending"
              value={stats?.pendingInspections || 0}
              icon="clipboard"
              color={theme.primary}
              onPress={() => navigation.navigate('InspectionsTab')}
            />
            <StatCard
              title="Overdue"
              value={stats?.overdueSamples || 0}
              icon="alert-circle"
              color={theme.accent}
              onPress={() => navigation.navigate('SamplesTab')}
            />
          </>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statsContainer}>
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="In Transit"
              value={stats?.samplesInTransit || 0}
              icon="truck"
              color={theme.warning}
              onPress={() => navigation.navigate('SamplesTab')}
            />
            <StatCard
              title="This Month"
              value={stats?.completedThisMonth || 0}
              icon="check-circle"
              color={theme.success}
            />
          </>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sectionHeader}>
        <ThemedText type="h3">Urgent Actions</ThemedText>
        {urgentActions.length > 0 ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {urgentActions.length} item{urgentActions.length !== 1 ? 's' : ''}
          </ThemedText>
        ) : null}
      </Animated.View>
    </View>
  );

  const renderUrgentAction = ({ item, index }: { item: UrgentAction; index: number }) => (
    <Animated.View entering={FadeInDown.delay(500 + index * 100).duration(400)}>
      <UrgentActionCard
        action={item}
        onPress={() => {
          if (item.sampleId) {
            navigation.navigate('SamplesTab');
          }
        }}
      />
    </Animated.View>
  );

  const renderEmptyState = () => (
    <EmptyState
      image={require('../../assets/images/dashboard-empty.png')}
      title="All Caught Up!"
      description="You have no urgent actions at the moment. Great work keeping up with your inspections."
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={urgentActions}
        keyExtractor={(item) => item.id}
        renderItem={renderUrgentAction}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          urgentActions.length === 0 && !isLoading && styles.emptyContent,
        ]}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
  },
  headerContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
});
