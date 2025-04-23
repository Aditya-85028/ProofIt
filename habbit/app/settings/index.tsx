import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const SettingItem = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) => (
  <TouchableOpacity style={styles.settingItem}>
    <View style={styles.settingIcon}>
      <Ionicons name={icon as any} size={24} color="#4CAF50" />
    </View>
    <View style={styles.settingText}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={24} color="#6B7280" />
  </TouchableOpacity>
);

const Settings = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="close-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="person-outline"
            title="Profile"
            subtitle="Edit your profile information"
          />
          <SettingItem
            icon="key-outline"
            title="Password & Security"
            subtitle="Manage your account security"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Customize your notifications"
          />
          <SettingItem
            icon="color-palette-outline"
            title="Display"
            subtitle="Customize app appearance"
          />
          <SettingItem
            icon="accessibility-outline"
            title="Accessibility"
            subtitle="Configure accessibility options"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy Settings"
            subtitle="Manage your privacy preferences"
          />
          <SettingItem
            icon="eye-outline"
            title="Activity Status"
            subtitle="Control who can see your activity"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem icon="help-circle-outline" title="Help Center" />
          <SettingItem icon="information-circle-outline" title="About" subtitle="Version 1.0.0" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
});

export default Settings;
