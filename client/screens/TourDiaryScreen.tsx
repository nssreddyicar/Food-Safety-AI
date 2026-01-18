import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';

interface TourEntry {
  date: number;
  from: string;
  to: string;
  oneWayDistance?: string;
  distance: string;
  modeOfTravel: string;
  purposeOfVisit: string;
  signature: string;
}

interface MonthData {
  [day: number]: TourEntry;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MODE_OPTIONS = ['Car', 'Bike', 'Bus', 'Train', 'Auto', 'Walking', 'Other'];

const TOUR_DIARY_KEY = '@tour_diary';

// Telangana Government Public Holidays 2026 (month is 0-indexed)
const PUBLIC_HOLIDAYS_2026: { [key: string]: string } = {
  // January
  '2026-0-14': 'Bhogi',
  '2026-0-15': 'Sankranti / Pongal',
  '2026-0-26': 'Republic Day',
  // February
  '2026-1-16': 'Maha Shivaratri',
  // March
  '2026-2-19': 'Holi',
  '2026-2-28': 'Ugadi (Telugu New Year)',
  // April
  '2026-3-3': 'Good Friday',
  '2026-3-14': 'Dr. B.R. Ambedkar Jayanti',
  '2026-3-20': 'Id-ul-Fitr (Ramzan)',
  // May
  '2026-4-1': 'May Day',
  '2026-4-29': 'Telangana Formation Day',
  // June
  '2026-5-27': 'Bakrid / Eid al-Adha',
  // July
  '2026-6-17': 'Bonalu (Hyderabad)',
  '2026-6-27': 'Muharram',
  // August
  '2026-7-15': 'Independence Day',
  '2026-7-30': 'Vinayaka Chaturthi',
  // September
  '2026-8-6': 'Sri Krishna Janmashtami',
  '2026-8-26': 'Eid Milad-un-Nabi',
  // October
  '2026-9-2': 'Gandhi Jayanti',
  '2026-9-18': 'Dussehra (Maha Navami)',
  '2026-9-19': 'Vijaya Dashami',
  // November
  '2026-10-8': 'Deepavali',
};

// Optional Holidays 2026 (shown in green)
const OPTIONAL_HOLIDAYS_2026: { [key: string]: string } = {
  '2026-7-28': 'Varalakshmi Vratham',
  '2026-10-25': 'Guru Nanak Jayanti',
};

function getPublicHolidayName(year: number, month: number, day: number): string | null {
  const key = `${year}-${month}-${day}`;
  return PUBLIC_HOLIDAYS_2026[key] || null;
}

function getOptionalHolidayName(year: number, month: number, day: number): string | null {
  const key = `${year}-${month}-${day}`;
  return OPTIONAL_HOLIDAYS_2026[key] || null;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getDayName(year: number, month: number, day: number): string {
  const date = new Date(year, month, day);
  return DAYS_OF_WEEK[date.getDay()];
}

function isSecondSaturday(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  if (date.getDay() !== 6) return false;
  
  let saturdayCount = 0;
  for (let d = 1; d <= day; d++) {
    const checkDate = new Date(year, month, d);
    if (checkDate.getDay() === 6) {
      saturdayCount++;
    }
  }
  return saturdayCount === 2;
}

export default function TourDiaryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [monthData, setMonthData] = useState<MonthData>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<TourEntry>>({});
  
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  
  const loadMonthData = useCallback(async () => {
    try {
      const key = `${TOUR_DIARY_KEY}_${selectedYear}_${selectedMonth}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setMonthData(JSON.parse(stored));
      } else {
        setMonthData({});
      }
    } catch (error) {
      console.error('Error loading tour diary:', error);
    }
  }, [selectedYear, selectedMonth]);
  
  useFocusEffect(
    useCallback(() => {
      loadMonthData();
    }, [loadMonthData])
  );
  
  const saveMonthData = async (data: MonthData) => {
    try {
      const key = `${TOUR_DIARY_KEY}_${selectedYear}_${selectedMonth}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
      setMonthData(data);
    } catch (error) {
      console.error('Error saving tour diary:', error);
    }
  };
  
  const openEditModal = (day: number) => {
    const existing = monthData[day];
    setEditingDay(day);
    setEditForm(existing || {
      date: day,
      from: '',
      to: '',
      oneWayDistance: '',
      distance: '',
      modeOfTravel: '',
      purposeOfVisit: '',
      signature: '',
    });
    setEditModalVisible(true);
  };
  
  const saveEntry = async () => {
    if (editingDay === null) return;
    
    const newData = {
      ...monthData,
      [editingDay]: {
        date: editingDay,
        from: editForm.from || '',
        to: editForm.to || '',
        oneWayDistance: editForm.oneWayDistance || '',
        distance: editForm.distance || '',
        modeOfTravel: editForm.modeOfTravel || '',
        purposeOfVisit: editForm.purposeOfVisit || '',
        signature: editForm.signature || '',
      },
    };
    
    await saveMonthData(newData);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditModalVisible(false);
    setEditingDay(null);
  };
  
  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };
  
  const renderTableHeader = () => (
    <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: Colors.light.primary }]}>
      <Text style={[styles.headerCell, styles.slNoCell]}>Sl. No</Text>
      <Text style={[styles.headerCell, styles.dateCell]}>Date (Day)</Text>
      <Text style={[styles.headerCell, styles.fromCell]}>From</Text>
      <Text style={[styles.headerCell, styles.toCell]}>To</Text>
      <Text style={[styles.headerCell, styles.distanceCell]}>Distance{'\n'}(To & Fro)</Text>
      <Text style={[styles.headerCell, styles.modeCell]}>Mode of{'\n'}Travel</Text>
      <Text style={[styles.headerCell, styles.purposeCell]}>Purpose of Visit</Text>
      <Text style={[styles.headerCell, styles.signatureCell]}>Signature</Text>
      <Text style={[styles.headerCell, styles.actionCell]}>Edit</Text>
    </View>
  );
  
  const renderTableRow = (day: number) => {
    const entry = monthData[day];
    const dayName = getDayName(selectedYear, selectedMonth, day);
    const isToday = today.getDate() === day && 
                    today.getMonth() === selectedMonth && 
                    today.getFullYear() === selectedYear;
    const isSunday = new Date(selectedYear, selectedMonth, day).getDay() === 0;
    const is2ndSaturday = isSecondSaturday(selectedYear, selectedMonth, day);
    const publicHolidayName = getPublicHolidayName(selectedYear, selectedMonth, day);
    const optionalHolidayName = getOptionalHolidayName(selectedYear, selectedMonth, day);
    const isPublicHoliday = isSunday || is2ndSaturday || publicHolidayName !== null;
    const isOptionalHoliday = optionalHolidayName !== null;
    
    let rowBgColor = theme.backgroundDefault;
    if (isToday) {
      rowBgColor = Colors.light.primary + '10';
    } else if (isPublicHoliday) {
      rowBgColor = '#FEE2E2'; // Light red
    } else if (isOptionalHoliday) {
      rowBgColor = '#D1FAE5'; // Light green
    }
    
    const dateColor = isPublicHoliday ? Colors.light.accent : (isOptionalHoliday ? Colors.light.success : theme.text);
    const holidayName = publicHolidayName || optionalHolidayName;
    const holidayColor = isOptionalHoliday ? Colors.light.success : Colors.light.accent;
    
    return (
      <View
        key={day}
        style={[
          styles.tableRow,
          { backgroundColor: rowBgColor },
        ]}
      >
        <Text style={[styles.cell, styles.slNoCell, { color: theme.text }]}>{day}</Text>
        <View style={styles.dateCell}>
          <Text style={[styles.cell, { color: dateColor }]}>
            {day} ({dayName})
          </Text>
          {holidayName ? (
            <Text style={[styles.holidayLabel, { color: holidayColor }]} numberOfLines={1}>{holidayName}</Text>
          ) : null}
        </View>
        <Text style={[styles.cell, styles.fromCell, { color: theme.text }]} numberOfLines={1}>
          {entry?.from || '-'}
        </Text>
        <Text style={[styles.cell, styles.toCell, { color: theme.text }]} numberOfLines={1}>
          {entry?.to || '-'}
        </Text>
        <Text style={[styles.cell, styles.distanceCell, { color: theme.text }]}>
          {entry?.distance || '-'}
        </Text>
        <Text style={[styles.cell, styles.modeCell, { color: theme.text }]} numberOfLines={1}>
          {entry?.modeOfTravel || '-'}
        </Text>
        <Text style={[styles.cell, styles.purposeCell, { color: theme.text }]} numberOfLines={1}>
          {entry?.purposeOfVisit || '-'}
        </Text>
        <Text style={[styles.cell, styles.signatureCell, { color: theme.text }]} numberOfLines={1}>
          {entry?.signature || '-'}
        </Text>
        <Pressable
          style={styles.actionCell}
          onPress={() => openEditModal(day)}
        >
          {entry?.from || entry?.to || entry?.purposeOfVisit ? (
            <Feather name="edit-2" size={16} color={Colors.light.primary} />
          ) : (
            <Feather name="plus-circle" size={18} color={Colors.light.success} />
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.monthSelector, { paddingTop: headerHeight + Spacing.md }]}>
        <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}>
          <Feather name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.monthDisplay}>
          <Text style={[styles.monthText, { color: theme.text }]}>
            {MONTHS[selectedMonth]} {selectedYear}
          </Text>
        </View>
        <Pressable onPress={() => changeMonth(1)} style={styles.navButton}>
          <Feather name="chevron-right" size={24} color={theme.text} />
        </Pressable>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.table}>
              {renderTableHeader()}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(renderTableRow)}
            </View>
          </ScrollView>
        </Card>
      </ScrollView>
      
      <Pressable
        style={[styles.fab, { bottom: tabBarHeight + Spacing.lg }]}
        onPress={() => openEditModal(today.getDate())}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>
      
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Edit Entry - {editingDay} {MONTHS[selectedMonth]}
              </Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>From</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="Starting location"
                  placeholderTextColor={theme.textSecondary}
                  value={editForm.from}
                  onChangeText={(text) => setEditForm({ ...editForm, from: text })}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>To</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="Destination"
                  placeholderTextColor={theme.textSecondary}
                  value={editForm.to}
                  onChangeText={(text) => setEditForm({ ...editForm, to: text })}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>One-way Distance (km)</Text>
                <View style={styles.distanceInputRow}>
                  <TextInput
                    style={[styles.input, styles.distanceInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                    placeholder="e.g., 25"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={editForm.oneWayDistance || ''}
                    onChangeText={(text) => {
                      const oneWay = parseFloat(text) || 0;
                      const toFro = oneWay * 2;
                      setEditForm({ 
                        ...editForm, 
                        oneWayDistance: text,
                        distance: toFro > 0 ? toFro.toString() : '' 
                      });
                    }}
                  />
                  <Pressable
                    style={[styles.distanceFetchButton, { backgroundColor: Colors.light.primary }]}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        alert('Distance calculation requires Google Maps API integration. Please enter distance manually.');
                      } else {
                        Alert.alert(
                          'Calculate Distance',
                          'Automatic distance calculation requires Google Maps API integration. For now, please enter the one-way distance manually.',
                          [{ text: 'OK' }]
                        );
                      }
                    }}
                  >
                    <Feather name="map-pin" size={20} color="#fff" />
                  </Pressable>
                </View>
                {editForm.distance ? (
                  <Text style={[styles.calculatedDistance, { color: Colors.light.success }]}>
                    To & Fro Distance: {editForm.distance} km
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Mode of Travel</Text>
                <View style={styles.modeOptions}>
                  {MODE_OPTIONS.map((mode) => (
                    <Pressable
                      key={mode}
                      style={[
                        styles.modeChip,
                        {
                          backgroundColor: editForm.modeOfTravel === mode ? Colors.light.primary : theme.backgroundSecondary,
                          borderColor: editForm.modeOfTravel === mode ? Colors.light.primary : theme.border,
                        },
                      ]}
                      onPress={() => setEditForm({ ...editForm, modeOfTravel: mode })}
                    >
                      <Text
                        style={[
                          styles.modeChipText,
                          { color: editForm.modeOfTravel === mode ? '#fff' : theme.text },
                        ]}
                      >
                        {mode}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Purpose of Visit</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="Describe the purpose of your visit"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={editForm.purposeOfVisit}
                  onChangeText={(text) => setEditForm({ ...editForm, purposeOfVisit: text })}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Signature / Remarks</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="Your signature or remarks"
                  placeholderTextColor={theme.textSecondary}
                  value={editForm.signature}
                  onChangeText={(text) => setEditForm({ ...editForm, signature: text })}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: Colors.light.primary }]}
                onPress={saveEntry}
              >
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.saveButtonText}>Save</Text>
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  table: {
    minWidth: 820,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeader: {
    borderBottomWidth: 2,
  },
  headerCell: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    textAlign: 'center',
  },
  cell: {
    fontSize: 12,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    textAlign: 'center',
  },
  slNoCell: {
    width: 35,
  },
  dateCell: {
    width: 100,
    justifyContent: 'center',
  },
  holidayLabel: {
    fontSize: 9,
    fontWeight: '500',
    paddingHorizontal: Spacing.xs,
  },
  fromCell: {
    width: 90,
  },
  toCell: {
    width: 90,
  },
  distanceCell: {
    width: 60,
  },
  modeCell: {
    width: 70,
  },
  purposeCell: {
    width: 130,
    textAlign: 'left',
  },
  signatureCell: {
    width: 80,
  },
  actionCell: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxHeight: '85%',
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
  formScroll: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  calculatedDistance: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  distanceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  distanceInput: {
    flex: 1,
  },
  distanceFetchButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  modeChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  modeChipText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
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
