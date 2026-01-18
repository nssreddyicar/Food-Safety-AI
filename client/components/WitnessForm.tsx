import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { Input } from '@/components/Input';
import { useTheme } from '@/hooks/useTheme';
import { Witness } from '@/types';
import { Spacing, BorderRadius } from '@/constants/theme';

interface WitnessFormProps {
  witness: Partial<Witness>;
  onUpdate: (witness: Partial<Witness>) => void;
  onRemove: () => void;
  index: number;
}

export function WitnessForm({ witness, onUpdate, onRemove, index }: WitnessFormProps) {
  const { theme } = useTheme();

  const handleAadhaarImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onUpdate({ ...witness, aadhaarImage: result.assets[0].uri });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSignaturePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onUpdate({ ...witness, signature: result.assets[0].uri });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <View style={styles.header}>
        <ThemedText type="h4">Witness {index + 1}</ThemedText>
        <Pressable onPress={onRemove} style={styles.removeButton}>
          <Feather name="trash-2" size={18} color={theme.accent} />
        </Pressable>
      </View>

      <Input
        label="Witness Name"
        placeholder="Enter full name"
        value={witness.name || ''}
        onChangeText={(text) => onUpdate({ ...witness, name: text })}
      />

      <View style={styles.row}>
        <View style={styles.flexTwo}>
          <Input
            label="S/o, D/o, W/o"
            placeholder="Son of / Daughter of / Wife of"
            value={witness.sonOfName || ''}
            onChangeText={(text) => onUpdate({ ...witness, sonOfName: text })}
          />
        </View>
        <View style={styles.flexOne}>
          <Input
            label="Age (Years)"
            placeholder="Age"
            value={witness.age?.toString() || ''}
            onChangeText={(text) => onUpdate({ ...witness, age: text ? parseInt(text) : undefined })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Input
        label="Address"
        placeholder="Enter complete address"
        value={witness.address || ''}
        onChangeText={(text) => onUpdate({ ...witness, address: text })}
        multiline
      />

      <Input
        label="Phone Number"
        placeholder="Enter phone number"
        value={witness.phone || ''}
        onChangeText={(text) => onUpdate({ ...witness, phone: text })}
        keyboardType="phone-pad"
      />

      <Input
        label="Aadhaar Number (Optional)"
        placeholder="XXXX XXXX XXXX"
        value={witness.aadhaarNumber || ''}
        onChangeText={(text) => onUpdate({ ...witness, aadhaarNumber: text })}
        keyboardType="numeric"
      />

      <View style={styles.imageRow}>
        <View style={styles.imageContainer}>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>Aadhaar Image (Optional)</ThemedText>
          <Pressable
            onPress={handleAadhaarImagePick}
            style={[styles.imageButton, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
          >
            {witness.aadhaarImage ? (
              <Image source={{ uri: witness.aadhaarImage }} style={styles.previewImage} />
            ) : (
              <>
                <Feather name="image" size={24} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Upload</ThemedText>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.imageContainer}>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>Signature (Optional)</ThemedText>
          <Pressable
            onPress={handleSignaturePick}
            style={[styles.imageButton, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
          >
            {witness.signature ? (
              <Image source={{ uri: witness.signature }} style={styles.previewImage} />
            ) : (
              <>
                <Feather name="edit-3" size={24} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Upload</ThemedText>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    padding: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flexOne: {
    flex: 1,
  },
  flexTwo: {
    flex: 2,
  },
  imageRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imageContainer: {
    flex: 1,
  },
  imageButton: {
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
