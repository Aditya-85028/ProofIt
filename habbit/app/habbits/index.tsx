import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getCurrentUser } from "aws-amplify/auth";
import { fetchUserHabits, deleteUserHabit } from "../../utils/api";
import SwipeableNavigation from "../../components/SwipeableNavigation";
import SwipeableHabbitCard from "../../components/SwipeableHabbitCard";

type Habbit = {
  id: string;
  name: string;
  streak: number;
  goal: string;
  progress: number;
  color?: string; // Added color property
};

// Using the SwipeableHabbitCard component instead of the static HabbitCard

const Habbits = () => {
  const [habits, setHabits] = useState<Habbit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      // Get the current user's ID
      const { userId } = await getCurrentUser();

      // Fetch the user's habits
      const response = await fetchUserHabits(userId);

      if (response && response.habits) {
        // Transform the API response to match our Habbit type
        const transformedHabits = response.habits.map((habit: any) => ({
          id: habit.habit_id || habit.id || String(Math.random()),
          name: habit.habit_name || habit.name,
          streak: habit.streak || 0,
          goal: habit.goal || `Do ${habit.habit_name} every day`,
          progress: habit.progress || 0.5,
          color: habit.color || "#4CAF50",
        }));

        setHabits(transformedHabits);
      } else {
        setHabits([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching habits:", err);
      setError("Failed to load habits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle habit deletion
  const handleDeleteHabit = (habitId: string) => {
    // Remove the habit from the state
    setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
  };

  // Use both useEffect for initial load and useFocusEffect for when returning to this screen
  useEffect(() => {
    fetchHabits();
  }, []);

  // This will run every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchHabits();
      return () => {};
    }, [])
  );

  return (
    <SwipeableNavigation>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Habbits</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading habits...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setIsLoading(true);
                setError(null);
                // Re-fetch habits
                const fetchHabits = async () => {
                  try {
                    const { userId } = await getCurrentUser();
                    const response = await fetchUserHabits(userId);

                    if (response && response.habits) {
                      const transformedHabits = response.habits.map((habit: any) => ({
                        id: habit.habit_id || habit.id || String(Math.random()),
                        name: habit.habit_name || habit.name,
                        streak: habit.streak || 0,
                        goal: habit.goal || `Do ${habit.habit_name} every day`,
                        progress: habit.progress || 0.5,
                        color: habit.color || "#4CAF50",
                      }));

                      setHabits(transformedHabits);
                    } else {
                      setHabits([]);
                    }
                  } catch (err) {
                    console.error("Error fetching habits:", err);
                    setError("Failed to load habits. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                };
                fetchHabits();
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {habits.length > 0 ? (
              habits.map((habbit) => (
                <SwipeableHabbitCard key={habbit.id} habbit={habbit} onDelete={handleDeleteHabit} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No habits found. Create your first habit!</Text>
              </View>
            )}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/habbits/create")}>
          <Text style={styles.addButtonText}>+ Add New Habbit</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SwipeableNavigation>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4CAF50",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
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
  habbitName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  goalText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    alignItems: "center",
    margin: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Habbits;
