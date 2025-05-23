import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getCurrentUser } from "aws-amplify/auth";
import { fetchUserHabits, updateUserHabit } from "../../../utils/api";

// Predefined color options for habits (same as in create.tsx)
//TODO THE BACK BUTTON IS NOT SENDING TO HOME PAGE PROPERLY FIX!!!!!
const COLORS = [
  { id: 1, value: "#4CAF50", name: "Green" },
  { id: 2, value: "#2196F3", name: "Blue" },
  { id: 3, value: "#F44336", name: "Red" },
  { id: 4, value: "#FF9800", name: "Orange" },
  { id: 5, value: "#9C27B0", name: "Purple" },
  { id: 6, value: "#00BCD4", name: "Cyan" },
  { id: 7, value: "#FFEB3B", name: "Yellow" },
  { id: 8, value: "#795548", name: "Brown" },
];

const EditHabit = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habitName, setHabitName] = useState("");
  const [cadence, setCadence] = useState("1");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch the habit data to pre-populate the form
  useEffect(() => {
    const fetchHabitData = async () => {
      try {
        setIsLoading(true);
        // Get the current user's ID
        const { userId: currentUserId } = await getCurrentUser();
        setUserId(currentUserId);
        
        // Fetch all habits and find the one with matching ID
        const response = await fetchUserHabits(currentUserId);
        
        if (response && response.habits) {
          const habitData = response.habits.find((h: any) => 
            (h.habit_id || h.id) === id
          );
          
          if (habitData) {
            // Pre-populate form with existing habit data
            setHabitName(habitData.habit_name || habitData.name);
            setCadence(habitData.cadence || "1");
            setSelectedColor(habitData.color || "#4CAF50");
          } else {
            setError("Habit not found");
          }
        } else {
          setError("Failed to load habit data");
        }
      } catch (err) {
        console.error("Error fetching habit data:", err);
        setError("Failed to load habit data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchHabitData();
    } else {
      setError("Invalid habit ID");
      setIsLoading(false);
    }
  }, [id]);

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

    setIsSaving(true);

    try {
      // Call the API utility function to update the habit
      await updateUserHabit(
        userId,
        id as string,
        habitName.trim(),
        cadence,
        selectedColor
      );

      Alert.alert("Success", "Habit updated successfully!", [
        { 
          text: "OK", 
          onPress: () => {
            // Navigate directly to the habit details page instead of going back
            // This will cause the page to refresh and show updated data
            router.replace(`/habbits/${id}`);
          } 
        }
      ]);
    } catch (error) {
      console.error("Error updating habit:", error);
      Alert.alert("Error", `Failed to update habit: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading habit data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Habit</Text>
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
          <View style={styles.colorContainer}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[
                  styles.colorOption,
                  { backgroundColor: color.value },
                  selectedColor === color.value && styles.selectedColorOption,
                ]}
                onPress={() => setSelectedColor(color.value)}
              >
                {selectedColor === color.value && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>Select a color for your habit</Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSaving}
      >
        <Text style={styles.submitButtonText}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Text>
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
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 16,
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
    fontWeight: "500",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
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
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default EditHabit;