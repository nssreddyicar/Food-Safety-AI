import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InstitutionalInspectionsScreen from "@/screens/InstitutionalInspectionsScreen";
import NewInstitutionalInspectionScreen from "@/screens/NewInstitutionalInspectionScreen";
import InstitutionalInspectionAssessmentScreen from "@/screens/InstitutionalInspectionAssessmentScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type InstitutionalInspectionsStackParamList = {
  InstitutionalInspectionsList: undefined;
  NewInstitutionalInspection: undefined;
  InstitutionalInspectionAssessment: { inspectionId: string };
  InstitutionalInspectionDetails: { inspectionId: string };
};

const Stack = createNativeStackNavigator<InstitutionalInspectionsStackParamList>();

export default function InstitutionalInspectionsStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="InstitutionalInspectionsList"
        component={InstitutionalInspectionsScreen}
        options={{ headerTitle: "Institutional Inspections" }}
      />
      <Stack.Screen
        name="NewInstitutionalInspection"
        component={NewInstitutionalInspectionScreen}
        options={{
          ...opaqueScreenOptions,
          presentation: "modal",
          headerTitle: "New Inspection",
        }}
      />
      <Stack.Screen
        name="InstitutionalInspectionAssessment"
        component={InstitutionalInspectionAssessmentScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Risk Assessment",
        }}
      />
    </Stack.Navigator>
  );
}
