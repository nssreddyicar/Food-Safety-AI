import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SafetyAssessmentScreen from "@/screens/SafetyAssessmentScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type InstitutionalInspectionsStackParamList = {
  SafetyAssessment: undefined;
};

const Stack = createNativeStackNavigator<InstitutionalInspectionsStackParamList>();

export default function InstitutionalInspectionsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="SafetyAssessment"
        component={SafetyAssessmentScreen}
        options={{ headerTitle: "Safety Assessment" }}
      />
    </Stack.Navigator>
  );
}
