import React, { useState } from "react";
import { router } from "expo-router";

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type DayUpdate = {
  date: string;
  imageUrl: any;
  completed: boolean;
};

const mockUpdates: DayUpdate[] = [
  {
    date: "2024-01-15",
    imageUrl: "https://reactnative.dev/img/tiny_logo.png",
    completed: true,
  },
  // Add more mock data as needed
];

const Profile = () => {
  const [selectedDay, setSelectedDay] = useState<DayUpdate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const renderCalendarDay = (date: string, hasUpdate: boolean) => (
    <TouchableOpacity
      style={[styles.calendarDay, hasUpdate && styles.calendarDayWithUpdate]}
      onPress={() => {
        const update = mockUpdates.find((u) => u.date === date);
        if (update) {
          setSelectedDay(update);
          setModalVisible(true);
        }
      }}
    >
      <Text style={styles.calendarDayText}>{new Date(date).getDate()}</Text>
      {hasUpdate && <View style={styles.updateDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={require("../../assets/images/placeholder-avatar-dog.svg")}
            style={styles.avatar}
          />
          <Text style={styles.username}>Imran Haidery</Text>
          <TouchableOpacity onPress={() => {}} style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>My Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Habbits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>Activity Calendar</Text>
          <View style={styles.calendar}>
            {/* Generate calendar grid here */}
            {Array.from({ length: 31 }, (_, i) => {
              const date = `2024-01-${String(i + 1).padStart(2, "0")}`;
              const hasUpdate = mockUpdates.some((u) => u.date === date);
              return renderCalendarDay(date, hasUpdate);
            })}
          </View>
        </View>
      </ScrollView>

      {/* Day Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      ></Modal>
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
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 4,
  },
  editButton: {
    padding: 4,
  },
  closeButton: {
    padding: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  content: {
    flex: 1,
  },
  progressSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  calendarSection: {
    padding: 16,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  calendarDay: {
    width: (Dimensions.get("window").width - 80) / 7,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  calendarDayWithUpdate: {
    backgroundColor: "#e8f5e9",
  },
  calendarDayText: {
    fontSize: 16,
    color: "#111827",
  },
  updateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    position: "absolute",
    bottom: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
});

export default Profile;
