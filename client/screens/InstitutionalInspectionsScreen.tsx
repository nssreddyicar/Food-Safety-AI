import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Input } from "@/components/Input";
import { FilterChips } from "@/components/FilterChips";
import { FAB } from "@/components/FAB";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuthContext } from "@/context/AuthContext";
import { Spacing, FontSize, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface InstitutionalInspection {
  id: string;
  inspectionCode: string;
  institutionTypeId: string;
  institutionName: string;
  institutionAddress: string;
  inspectionDate: string;
  riskClassification: 'low' | 'medium' | 'high' | null;
  totalScore: number;
  status: 'draft' | 'submitted' | 'approved';
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
];

const RISK_COLORS = {
  high: { bg: '#FEE2E2', text: '#DC2626' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  low: { bg: '#D1FAE5', text: '#059669' },
};

export default function InstitutionalInspectionsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();

  const [inspections, setInspections] = useState<InstitutionalInspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<InstitutionalInspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const jurisdictionId = user?.jurisdiction?.unitId;

  const loadData = useCallback(async () => {
    try {
      const url = new URL('/api/institutional-inspections', getApiUrl());
      if (jurisdictionId) {
        url.searchParams.set("jurisdictionId", jurisdictionId);
      }
      
      const response = await fetch(url.toString());
      
      if (response.ok) {
        const data = await response.json();
        setInspections(data);
        filterInspections(data, searchQuery, statusFilter);
      }
    } catch (error) {
      console.error("Failed to load institutional inspections:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, statusFilter, jurisdictionId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filterInspections = (
    data: InstitutionalInspection[],
    query: string,
    status: string
  ) => {
    let filtered = data;

    if (status !== "all") {
      filtered = filtered.filter((i) => i.status === status);
    }

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.institutionName.toLowerCase().includes(lowerQuery) ||
          i.institutionAddress.toLowerCase().includes(lowerQuery) ||
          i.inspectionCode.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredInspections(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterInspections(inspections, query, statusFilter);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    filterInspections(inspections, searchQuery, status);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const getRiskBadge = (risk: string | null) => {
    if (!risk) return null;
    const colors = RISK_COLORS[risk as keyof typeof RISK_COLORS];
    return (
      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
        <ThemedText style={[styles.badgeText, { color: colors.text }]}>
          {risk.toUpperCase()}
        </ThemedText>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: InstitutionalInspection; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Pressable
        onPress={() => navigation.navigate("InstitutionalInspectionAssessment", { inspectionId: item.id })}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.codeContainer}>
              <Feather name="clipboard" size={16} color={theme.primary} />
              <ThemedText style={[styles.code, { color: theme.primary }]}>
                {item.inspectionCode}
              </ThemedText>
            </View>
            {getRiskBadge(item.riskClassification)}
          </View>
          
          <ThemedText style={styles.institutionName}>{item.institutionName}</ThemedText>
          <ThemedText style={[styles.address, { color: theme.textSecondary }]}>
            {item.institutionAddress}
          </ThemedText>
          
          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Feather name="calendar" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
                {new Date(item.inspectionDate).toLocaleDateString()}
              </ThemedText>
            </View>
            
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'submitted' ? '#D1FAE5' : '#E5E7EB' }
            ]}>
              <ThemedText style={[
                styles.statusText,
                { color: item.status === 'submitted' ? '#059669' : '#6B7280' }
              ]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </ThemedText>
            </View>
          </View>
          
          {item.totalScore > 0 ? (
            <View style={styles.scoreContainer}>
              <ThemedText style={[styles.scoreLabel, { color: theme.textSecondary }]}>
                Risk Score:
              </ThemedText>
              <ThemedText style={[styles.scoreValue, { color: theme.primary }]}>
                {item.totalScore}
              </ThemedText>
            </View>
          ) : null}
        </Card>
      </Pressable>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="clipboard" size={48} color={theme.textSecondary} />
      <ThemedText type="h3" style={styles.emptyTitle}>
        No Institutional Inspections
      </ThemedText>
      <ThemedText style={[styles.emptyMessage, { color: theme.textSecondary }]}>
        Start by creating a new institutional food safety inspection
      </ThemedText>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <Card key={i} style={styles.skeletonCard}>
          <View style={[styles.skeletonLine, { width: '40%', backgroundColor: theme.border }]} />
          <View style={[styles.skeletonLine, { width: '80%', backgroundColor: theme.border }]} />
          <View style={[styles.skeletonLine, { width: '60%', backgroundColor: theme.border }]} />
        </Card>
      ))}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.md }]}>
        <Input
          placeholder="Search institutions..."
          value={searchQuery}
          onChangeText={handleSearch}
          icon="search"
          style={styles.searchInput}
        />
        
        <View style={styles.filtersContainer}>
          <FilterChips
            options={STATUS_FILTERS}
            selectedValue={statusFilter}
            onSelect={handleFilterChange}
          />
        </View>

        {isLoading ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={filteredInspections}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + 100 },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.primary}
              />
            }
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FAB
        icon="plus"
        onPress={() => navigation.navigate("NewInstitutionalInspection")}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    marginBottom: Spacing.sm,
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  list: {
    paddingTop: Spacing.sm,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  code: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  institutionName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: FontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scoreLabel: {
    fontSize: FontSize.sm,
  },
  scoreValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing["2xl"],
    gap: Spacing.md,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    maxWidth: 280,
  },
  skeletonContainer: {
    paddingTop: Spacing.md,
  },
  skeletonCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    opacity: 0.5,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
});
