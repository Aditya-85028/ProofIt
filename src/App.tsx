import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./app/(tabs)/index"; // Adjust this path if needed
import "./global.css";

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
