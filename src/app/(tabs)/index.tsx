import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import Home from "../../screens/Home"; // Correct import path
import Profile from "@/screens/Profile";
import Welcome from "@/screens/Welcome";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tabs>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Welcome" component={Welcome} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tabs>
  );
}
