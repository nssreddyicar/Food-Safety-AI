import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuthContext } from "@/context/AuthContext";
import { Spacing, FontSize } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface InstitutionType {
  id: string;
  name: string;
  code: string;
  category: string;
}

interface ResponsiblePerson {
  name: string;
  parentName: string;
  age: string;
  mobile: string;
  fssaiLicense?: string;
}

export default function NewInstitutionalInspectionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [institutionTypes, setInstitutionTypes] = useState<InstitutionType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [showTypePicker, setShowTypePicker] = useState(false);

  const [institutionName, setInstitutionName] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [headOfInstitution, setHeadOfInstitution] = useState<ResponsiblePerson>({
    name: "", parentName: "", age: "", mobile: "",
  });
  const [inchargeWarden, setInchargeWarden] = useState<ResponsiblePerson>({
    name: "", parentName: "", age: "", mobile: "",
  });
  const [contractor, setContractor] = useState<ResponsiblePerson>({
    name: "", parentName: "", age: "", mobile: "", fssaiLicense: "",
  });

  useEffect(() => {
    loadInstitutionTypes();
    requestLocation();
  }, []);

  const loadInstitutionTypes = async () => {
    try {
      const response = await fetch(
        new URL('/api/institutional-inspections/institution-types', getApiUrl()).toString()
      );
      if (response.ok) {
        const data = await response.json();
        setInstitutionTypes(data);
      }
    } catch (error) {
      console.error("Failed to load institution types:", error);
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude.toString());
        setLongitude(location.coords.longitude.toString());
      }
    } catch (error) {
      console.error("Location error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTypeId || !institutionName || !institutionAddress) {
      Alert.alert("Required Fields", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        new URL('/api/institutional-inspections', getApiUrl()).toString(),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            institutionTypeId: selectedTypeId,
            institutionName,
            institutionAddress,
            districtId: user?.jurisdiction?.unitId,
            jurisdictionId: user?.jurisdiction?.unitId,
            latitude,
            longitude,
            inspectionDate: new Date().toISOString(),
            officerId: user?.id,
            headOfInstitution: headOfInstitution.name ? headOfInstitution : undefined,
            inchargeWarden: inchargeWarden.name ? inchargeWarden : undefined,
            contractorCookServiceProvider: contractor.name ? contractor : undefined,
          }),
        }
      );

      if (response.ok) {
        const inspection = await response.json();
        Alert.alert(
          "Inspection Created",
          `Inspection ${inspection.inspectionCode} created successfully. Proceed to the risk assessment.`,
          [
            {
              text: "Continue",
              onPress: () => navigation.replace("InstitutionalInspectionAssessment", { inspectionId: inspection.id }),
            },
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert("Error", error.error || "Failed to create inspection");
      }
    } catch (error) {
      console.error("Create inspection error:", error);
      Alert.alert("Error", "Failed to create inspection");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = institutionTypes.find(t => t.id === selectedTypeId);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + insets.bottom + Spacing.xl },
        ]}
      >
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Institution Details</ThemedText>
          
          <ThemedText style={styles.label}>Institution Type *</ThemedText>
          <Pressable
            style={[styles.picker, { borderColor: theme.border }]}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <ThemedText style={selectedType ? {} : { color: theme.textSecondary }}>
              {selectedType?.name || "Select institution type..."}
            </ThemedText>
            <Feather name="chevron-down" size={20} color={theme.textSecondary} />
          </Pressable>
          
          {showTypePicker ? (
            <View style={[styles.pickerOptions, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              {institutionTypes.map(type => (
                <Pressable
                  key={type.id}
                  style={[styles.pickerOption, selectedTypeId === type.id ? { backgroundColor: theme.primary + '20' } : undefined]}
                  onPress={() => {
                    setSelectedTypeId(type.id);
                    setShowTypePicker(false);
                  }}
                >
                  <ThemedText>{type.name}</ThemedText>
                  <ThemedText style={[styles.typeCode, { color: theme.textSecondary }]}>
                    {type.code}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Input
            label="Institution Name *"
            placeholder="Enter institution name"
            value={institutionName}
            onChangeText={setInstitutionName}
            style={styles.input}
          />

          <Input
            label="Address *"
            placeholder="Enter complete address"
            value={institutionAddress}
            onChangeText={setInstitutionAddress}
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <View style={styles.locationRow}>
            <View style={styles.locationCol}>
              <Input
                label="Latitude"
                placeholder="GPS Latitude"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.locationCol}>
              <Input
                label="Longitude"
                placeholder="GPS Longitude"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
            <Pressable
              style={[styles.locationBtn, { backgroundColor: theme.primary }]}
              onPress={requestLocation}
            >
              <Feather name="map-pin" size={20} color="white" />
            </Pressable>
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Head of Institution</ThemedText>
          
          <Input
            label="Name"
            placeholder="Full name"
            value={headOfInstitution.name}
            onChangeText={(v) => setHeadOfInstitution(prev => ({ ...prev, name: v }))}
            style={styles.input}
          />
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Input
                label="S/o or D/o"
                placeholder="Parent name"
                value={headOfInstitution.parentName}
                onChangeText={(v) => setHeadOfInstitution(prev => ({ ...prev, parentName: v }))}
              />
            </View>
            <View style={styles.halfCol}>
              <Input
                label="Age"
                placeholder="Age"
                value={headOfInstitution.age}
                onChangeText={(v) => setHeadOfInstitution(prev => ({ ...prev, age: v }))}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Input
            label="Mobile Number"
            placeholder="10-digit mobile"
            value={headOfInstitution.mobile}
            onChangeText={(v) => setHeadOfInstitution(prev => ({ ...prev, mobile: v }))}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Incharge / Warden</ThemedText>
          
          <Input
            label="Name"
            placeholder="Full name"
            value={inchargeWarden.name}
            onChangeText={(v) => setInchargeWarden(prev => ({ ...prev, name: v }))}
            style={styles.input}
          />
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Input
                label="S/o or D/o"
                placeholder="Parent name"
                value={inchargeWarden.parentName}
                onChangeText={(v) => setInchargeWarden(prev => ({ ...prev, parentName: v }))}
              />
            </View>
            <View style={styles.halfCol}>
              <Input
                label="Age"
                placeholder="Age"
                value={inchargeWarden.age}
                onChangeText={(v) => setInchargeWarden(prev => ({ ...prev, age: v }))}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Input
            label="Mobile Number"
            placeholder="10-digit mobile"
            value={inchargeWarden.mobile}
            onChangeText={(v) => setInchargeWarden(prev => ({ ...prev, mobile: v }))}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contractor / Cook / Service Provider</ThemedText>
          
          <Input
            label="Name"
            placeholder="Full name"
            value={contractor.name}
            onChangeText={(v) => setContractor(prev => ({ ...prev, name: v }))}
            style={styles.input}
          />
          <Input
            label="Mobile Number"
            placeholder="10-digit mobile"
            value={contractor.mobile}
            onChangeText={(v) => setContractor(prev => ({ ...prev, mobile: v }))}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Input
            label="FSSAI License / Registration Number"
            placeholder="If applicable"
            value={contractor.fssaiLicense}
            onChangeText={(v) => setContractor(prev => ({ ...prev, fssaiLicense: v }))}
            style={styles.input}
          />
        </Card>

        <Button
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitBtn}
        >
          {isLoading ? "Creating..." : "Create Inspection"}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  section: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    marginBottom: Spacing.sm,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: Spacing.sm,
  },
  pickerOptions: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    maxHeight: 200,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  typeCode: {
    fontSize: FontSize.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  locationCol: {
    flex: 1,
  },
  locationBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  halfCol: {
    flex: 1,
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
});
