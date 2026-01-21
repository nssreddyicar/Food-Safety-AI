import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

export default function SubmitComplaintScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [location, setLocation] = useState<{
    latitude: string;
    longitude: string;
    accuracy: string;
  } | null>(null);

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to capture incident location");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: loc.coords.latitude.toString(),
        longitude: loc.coords.longitude.toString(),
        accuracy: loc.coords.accuracy?.toString() || "0",
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const addressStr = [addr.street, addr.city, addr.region, addr.postalCode]
          .filter(Boolean)
          .join(", ");
        setAddress(addressStr);
      }

      Alert.alert("Success", "Location captured successfully");
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get location. Please enter address manually.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }
    if (!mobile.trim()) {
      Alert.alert("Required", "Please enter your mobile number");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Required", "Please describe the incident");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/complaints/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complainantName: name.trim(),
          complainantMobile: mobile.trim(),
          complainantEmail: email.trim() || undefined,
          incidentDescription: description.trim(),
          location: location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            source: "gps",
            address: address.trim(),
          } : {
            latitude: "0",
            longitude: "0",
            source: "manual",
            address: address.trim(),
          },
          submittedVia: "mobile",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit complaint");
      }

      Alert.alert(
        "Complaint Submitted",
        `Your complaint has been registered.\n\nComplaint ID: ${data.complaintCode}\n\nPlease save this ID to track your complaint status.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Submit error:", error);
      Alert.alert("Error", error.message || "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.infoCard}>
            <Feather name="info" size={20} color={theme.primary} />
            <ThemedText style={styles.infoText}>
              Report food safety violations such as expired products, unsanitary conditions, adulteration, or any health hazards.
            </ThemedText>
          </Card>

          <Card style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Your Details
            </ThemedText>
            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              icon="user"
            />
            <Input
              label="Mobile Number *"
              placeholder="Enter your mobile number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              icon="phone"
              containerStyle={styles.inputSpacing}
            />
            <Input
              label="Email (Optional)"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              containerStyle={styles.inputSpacing}
            />
          </Card>

          <Card style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Incident Details
            </ThemedText>
            <Input
              label="Description *"
              placeholder="Describe the food safety violation in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              containerStyle={styles.inputSpacing}
            />
          </Card>

          <Card style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Location
            </ThemedText>
            
            <Button
              onPress={handleGetLocation}
              disabled={isGettingLocation}
              style={styles.locationButton}
            >
              {isGettingLocation ? "Getting Location..." : "Capture Current Location"}
            </Button>

            {location ? (
              <View style={[styles.locationInfo, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="check-circle" size={16} color={theme.primary} />
                <ThemedText style={styles.locationText}>
                  Location captured: {location.latitude.slice(0, 8)}, {location.longitude.slice(0, 8)}
                </ThemedText>
              </View>
            ) : null}

            <Input
              label="Address / Landmark"
              placeholder="Enter the location address or nearby landmark"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              containerStyle={styles.inputSpacing}
            />
          </Card>

          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  inputSpacing: {
    marginTop: Spacing.md,
  },
  locationButton: {
    marginBottom: Spacing.md,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
