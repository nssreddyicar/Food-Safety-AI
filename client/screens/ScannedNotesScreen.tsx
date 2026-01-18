import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/Card';
import { ScannerStackParamList } from '@/navigation/ScannerStackNavigator';

interface ScannedNote {
  id: string;
  data: string;
  type: string;
  heading: string;
  scannedAt: string;
}

const NOTES_STORAGE_KEY = '@scanned_notes';

export default function ScannedNotesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ScannerStackParamList>>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const [notes, setNotes] = useState<ScannedNote[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const storedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const deleteNote = async (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedNotes = notes.filter((n) => n.id !== id);
              await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
              setNotes(updatedNotes);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCodeIcon = (type: string): keyof typeof Feather.glyphMap => {
    if (type.toLowerCase().includes('qr')) return 'grid';
    return 'align-justify';
  };

  const renderNote = ({ item }: { item: ScannedNote }) => (
    <Pressable
      onPress={() => navigation.navigate('NoteDetail', { note: item })}
      onLongPress={() => deleteNote(item.id)}
    >
      <Card style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.light.primary + '15' }]}>
            <Feather name={getCodeIcon(item.type)} size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.noteInfo}>
            <Text style={[styles.noteHeading, { color: theme.text }]} numberOfLines={1}>
              {item.heading}
            </Text>
            <View style={styles.noteMeta}>
              <Text style={[styles.noteType, { color: Colors.light.primary }]}>
                {item.type.toUpperCase()}
              </Text>
              <Text style={[styles.noteDot, { color: theme.textSecondary }]}>•</Text>
              <Text style={[styles.noteDate, { color: theme.textSecondary }]}>
                {formatDate(item.scannedAt)}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
        <Text style={[styles.noteData, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.data}
        </Text>
      </Card>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: tabBarHeight + Spacing.lg,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: Colors.light.primary + '15' }]}>
              <Feather name="file-text" size={48} color={Colors.light.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Scanned Notes</Text>
            <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
              Scan a QR code or barcode to save it as a note
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  noteCard: {
    padding: Spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteInfo: {
    flex: 1,
  },
  noteHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  noteType: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteDot: {
    fontSize: 12,
  },
  noteDate: {
    fontSize: 12,
  },
  noteData: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginLeft: 44 + Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
