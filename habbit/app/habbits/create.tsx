import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getCurrentUser } from "aws-amplify/auth";
import ColorPicker, { Colors } from "../../components/ColorPicker";

const CreateHabbit = () => {
  const [habitName, setHabitName] = useState("");
  const [cadence, setCadence] = useState("1");
  const [selectedColor, setSelectedColor] = useState(Colors[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Get the authenticated user's ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { userId: currentUserId } = await getCurrentUser();
        setUserId(currentUserId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
        Alert.alert("Authentication Error", "Please log in again.");
        router.replace("/login");
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    if (!habitName.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    if (!cadence || isNaN(Number(cadence)) || Number(cadence) < 1 || Number(cadence) > 7) {
      Alert.alert("Error", "Cadence must be between 1 and 7 days");
      return;
    }

    if (!selectedColor) {
      Alert.alert("Error", "Please select a color for your habit");
      return;
    }

    setIsLoading(true);

    try {
      // API endpoint URL from the project
      const apiUrl = "https://y8lbtj64c9.execute-api.us-east-1.amazonaws.com/prod/add_habit";

      // Convert cadence to a number and validate it
      const cadenceNumber = parseInt(cadence);
      if (isNaN(cadenceNumber) || cadenceNumber < 1 || cadenceNumber > 7) {
        throw new Error("Cadence must be a number between 1 and 7");
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        user_id: userId,
        habit_name: habitName.trim(),
        cadence: cadenceNumber.toString(), // Convert the number to string for URL params
        color: selectedColor,
      }).toString();

      const response = await fetch(`${apiUrl}?${queryParams}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to create habit");
      }

      Alert.alert("Success", "Habit created successfully!", [
        { text: "OK", onPress: () => router.replace("/habbits") },
      ]);
    } catch (error) {
      console.error("Error creating habit:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to create habit: ${errorMessage}`);
      // Also log the full error for debugging
      console.log("Full error object:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Habit</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            style={styles.input}
            value={habitName}
            onChangeText={setHabitName}
            placeholder="Enter habit name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Cadence (days)</Text>
          <TextInput
            style={styles.input}
            value={cadence}
            onChangeText={setCadence}
            placeholder="1-7 days"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={1}
          />
          <Text style={styles.helperText}>How often you want to perform this habit (1-7 days)</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Color</Text>
          <ColorPicker selectedColor={selectedColor} onColorSelect={setSelectedColor} />
          <Text style={styles.helperText}>Select a color for your habit</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>{isLoading ? "Creating..." : "Create Habit"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4CAF50",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  helperText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#000",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    alignItems: "center",
    margin: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreateHabbit;
