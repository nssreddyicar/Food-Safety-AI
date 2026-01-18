import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

export type TimePeriod = 
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'this_quarter'
  | 'this_fy'
  | 'last_month'
  | 'last_quarter'
  | 'last_fy'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'custom';

interface TimeFilterOption {
  id: TimePeriod;
  label: string;
  shortLabel?: string;
}

const TIME_FILTER_OPTIONS: TimeFilterOption[] = [
  { id: 'this_month', label: 'This Month', shortLabel: 'Month' },
  { id: 'this_quarter', label: 'This Quarter', shortLabel: 'Quarter' },
  { id: 'this_fy', label: 'This FY', shortLabel: 'FY' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'last_quarter', label: 'Last Quarter' },
  { id: 'last_fy', label: 'Last FY' },
  { id: 'q1', label: 'Q1 (Apr-Jun)' },
  { id: 'q2', label: 'Q2 (Jul-Sep)' },
  { id: 'q3', label: 'Q3 (Oct-Dec)' },
  { id: 'q4', label: 'Q4 (Jan-Mar)' },
];

interface TimeFilterProps {
  selected: TimePeriod;
  onSelect: (period: TimePeriod) => void;
  compact?: boolean;
}

export function getDateRangeForPeriod(period: TimePeriod): { startDate: string; endDate: string } {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const getFYYear = () => {
    return currentMonth >= 3 ? currentYear : currentYear - 1;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  switch (period) {
    case 'today': {
      return { startDate: formatDate(today), endDate: formatDate(today) };
    }
    case 'this_week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return { startDate: formatDate(startOfWeek), endDate: formatDate(endOfWeek) };
    }
    case 'this_month': {
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      return { startDate: formatDate(startOfMonth), endDate: formatDate(endOfMonth) };
    }
    case 'last_month': {
      const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfLastMonth = new Date(currentYear, currentMonth, 0);
      return { startDate: formatDate(startOfLastMonth), endDate: formatDate(endOfLastMonth) };
    }
    case 'this_quarter': {
      const fyYear = getFYYear();
      const fyQuarter = currentMonth >= 3 ? Math.floor((currentMonth - 3) / 3) : Math.floor((currentMonth + 9) / 3);
      const quarterStartMonth = (fyQuarter * 3 + 3) % 12;
      const quarterStartYear = quarterStartMonth >= 3 ? fyYear : fyYear + 1;
      const startOfQuarter = new Date(quarterStartYear, quarterStartMonth, 1);
      const endOfQuarter = new Date(quarterStartYear, quarterStartMonth + 3, 0);
      return { startDate: formatDate(startOfQuarter), endDate: formatDate(endOfQuarter) };
    }
    case 'last_quarter': {
      const fyYear = getFYYear();
      const fyQuarter = currentMonth >= 3 ? Math.floor((currentMonth - 3) / 3) : Math.floor((currentMonth + 9) / 3);
      const lastQuarter = (fyQuarter + 3) % 4;
      const lastQuarterStartMonth = (lastQuarter * 3 + 3) % 12;
      let lastQuarterStartYear = lastQuarterStartMonth >= 3 ? fyYear : fyYear + 1;
      if (lastQuarter >= fyQuarter) lastQuarterStartYear -= 1;
      const startOfQuarter = new Date(lastQuarterStartYear, lastQuarterStartMonth, 1);
      const endOfQuarter = new Date(lastQuarterStartYear, lastQuarterStartMonth + 3, 0);
      return { startDate: formatDate(startOfQuarter), endDate: formatDate(endOfQuarter) };
    }
    case 'this_fy': {
      const fyYear = getFYYear();
      const startOfFY = new Date(fyYear, 3, 1);
      const endOfFY = new Date(fyYear + 1, 2, 31);
      return { startDate: formatDate(startOfFY), endDate: formatDate(endOfFY) };
    }
    case 'last_fy': {
      const fyYear = getFYYear() - 1;
      const startOfFY = new Date(fyYear, 3, 1);
      const endOfFY = new Date(fyYear + 1, 2, 31);
      return { startDate: formatDate(startOfFY), endDate: formatDate(endOfFY) };
    }
    case 'q1': {
      const fyYear = getFYYear();
      const start = new Date(fyYear, 3, 1);
      const end = new Date(fyYear, 5, 30);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }
    case 'q2': {
      const fyYear = getFYYear();
      const start = new Date(fyYear, 6, 1);
      const end = new Date(fyYear, 8, 30);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }
    case 'q3': {
      const fyYear = getFYYear();
      const start = new Date(fyYear, 9, 1);
      const end = new Date(fyYear, 11, 31);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }
    case 'q4': {
      const fyYear = getFYYear();
      const start = new Date(fyYear + 1, 0, 1);
      const end = new Date(fyYear + 1, 2, 31);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }
    default:
      return { startDate: formatDate(today), endDate: formatDate(today) };
  }
}

export function getFilterLabel(period: TimePeriod): string {
  const option = TIME_FILTER_OPTIONS.find(o => o.id === period);
  return option?.label || period;
}

export function TimeFilter({ selected, onSelect, compact = false }: TimeFilterProps) {
  const { theme } = useTheme();

  const options = compact 
    ? TIME_FILTER_OPTIONS.slice(0, 3)
    : TIME_FILTER_OPTIONS;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = selected === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.chip,
              { 
                backgroundColor: isSelected ? theme.primary : theme.backgroundRoot,
                borderColor: isSelected ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText 
              type="small" 
              style={[
                styles.chipText,
                { color: isSelected ? '#FFFFFF' : theme.text }
              ]}
            >
              {compact ? (option.shortLabel || option.label) : option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
