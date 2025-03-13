import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HabitTrackerScreen from "../../screens/HabitTrackerScreen"; // Correct import path

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Habit Tracker" component={HabitTrackerScreen} />
    </Tab.Navigator>
  );
}
