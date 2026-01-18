import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TemplatesScreen from "@/screens/TemplatesScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type TemplatesStackParamList = {
  Templates: undefined;
};

const Stack = createNativeStackNavigator<TemplatesStackParamList>();

export default function TemplatesStackNavigator() {
  const screenOptions = useScreenOptions();
  
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{ headerTitle: "Templates" }}
      />
    </Stack.Navigator>
  );
}
