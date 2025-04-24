import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getCurrentUser } from "aws-amplify/auth";
import { fetchUserHabits } from "../../utils/api";
import StreakBadge from "../../components/StreakBadge";
import ProgressBar from "../../components/ProgressBar";

type Habit = {
  id: string;
  name: string;
  streak: number;
  goal: string;
  progress: number;
  color?: string;
  cadence?: string;
};

const HabitDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabitDetails = async () => {
      try {
        setIsLoading(true);
        // Get the current user's ID
        const { userId } = await getCurrentUser();

        // Fetch all habits and find the one with matching ID
        const response = await fetchUserHabits(userId);

        if (response && response.habits) {
          const habitData = response.habits.find((h: any) => (h.habit_id || h.id) === id);

          if (habitData) {
            // Transform the API response to match our Habit type
            setHabit({
              id: habitData.habit_id || habitData.id,
              name: habitData.habit_name || habitData.name,
              streak: habitData.streak || 0,
              goal: habitData.goal || `Do ${habitData.habit_name || habitData.name} every day`,
              progress: habitData.progress || 0.5,
              color: habitData.color || "#4CAF50",
              cadence: habitData.cadence || "1",
            });
          } else {
            setError("Habit not found");
          }
        } else {
          setError("Failed to load habit details");
        }
      } catch (err) {
        console.error("Error fetching habit details:", err);
        setError("Failed to load habit details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchHabitDetails();
    } else {
      setError("Invalid habit ID");
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading habit details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !habit) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || "Habit not found"}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/habbits")}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.navigationControls}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace("/habbits")}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push(`/habbits/edit/${habit.id}`)}
          >
            <Ionicons name="pencil" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: habit.color }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <StreakBadge streak={habit.streak}></StreakBadge>
          </View>
          <Text style={styles.goalText}>{habit.goal}</Text>
          <ProgressBar
            progress={habit.progress}
            backgroundColor="rgba(255, 255, 255, 0.3)"
            fillColor="rgba(255, 255, 255, 0.8)"
          />
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Cadence:</Text>
            <Text style={styles.detailValue}>
              {habit.cadence === "1" ? "Daily" : `${habit.cadence} days per week`}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Current Streak:</Text>
            <Text style={styles.detailValue}>{habit.streak} days</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Progress:</Text>
            <Text style={styles.detailValue}>{Math.round(habit.progress * 100)}%</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() =>
              Alert.alert(
                "Feature Coming Soon",
                "This feature will be available in a future update."
              )
            }
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Mark Complete</Text>
          </TouchableOpacity>
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
  navigationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  habitName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  goalText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  detailsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButton: {
    backgroundColor: "#4CAF50",
  },
  actionButtonText: {
    color: "#FFFFFF",
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

export default HabitDetail;
