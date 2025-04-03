import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
  withSpring
} from 'react-native-reanimated';
import { getCurrentUser } from "aws-amplify/auth";
import { deleteUserHabit } from '../utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80; // How far to swipe before delete button appears

type Habbit = {
  id: string;
  name: string;
  streak: number;
  goal: string;
  progress: number;
  color?: string;
};

interface SwipeableHabbitCardProps {
  habbit: Habbit;
  onDelete: (id: string) => void;
}

const SwipeableHabbitCard: React.FC<SwipeableHabbitCardProps> = ({ habbit, onDelete }) => {
  const translateX = useSharedValue(0);
  const cardHeight = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isDeleting = useRef(false);

  // Determine text colors based on background color for better contrast
  const cardBackgroundColor = habbit.color || "#4CAF50";
  const textColor = "#FFFFFF";
  const secondaryTextColor = "rgba(255, 255, 255, 0.8)";

  const handleDelete = async () => {
    if (isDeleting.current) return;
    isDeleting.current = true;

    try {
      // Confirm deletion with the user
      Alert.alert(
        "Delete Habit",
        `Are you sure you want to delete "${habbit.name}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              // Reset the card position
              translateX.value = withSpring(0);
              isDeleting.current = false;
            }
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                // Get the current user's ID
                const { userId } = await getCurrentUser();
                
                // Call the API to delete the habit
                await deleteUserHabit(userId, habbit.id);
                
                // Animate the card out
                translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
                opacity.value = withTiming(0, { duration: 300 });
                cardHeight.value = withTiming(0, { duration: 300 }, () => {
                  // After animation completes, call the onDelete callback
                  runOnJS(onDelete)(habbit.id);
                });
              } catch (error) {
                console.error("Error deleting habit:", error);
                Alert.alert("Error", "Failed to delete habit. Please try again.");
                // Reset the card position
                translateX.value = withSpring(0);
                isDeleting.current = false;
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error in delete handler:", error);
      isDeleting.current = false;
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swiping left (negative translation)
      if (event.translationX <= 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      // If swiped far enough to the left, show delete button
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(SWIPE_THRESHOLD);
      } else {
        // Otherwise, spring back to original position
        translateX.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      height: cardHeight.value === 0 ? undefined : cardHeight.value,
      opacity: opacity.value,
      marginBottom: cardHeight.value === 0 ? 0 : 16,
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < SWIPE_THRESHOLD / 2 ? 1 : 0,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedCardStyle]}>
      <GestureDetector gesture={panGesture}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: cardBackgroundColor }]}
          onLayout={(event) => {
            if (cardHeight.value === 0) {
              cardHeight.value = event.nativeEvent.layout.height;
            }
          }}
          onPress={() => router.push(`/habbits/${habbit.id}`)}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.habbitName, { color: textColor }]}>{habbit.name}</Text>
            <View style={[styles.streakBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="flame" size={16} color="#FFFFFF" />
              <Text style={[styles.streakText, { color: textColor }]}>{habbit.streak}</Text>
            </View>
          </View>

          <Text style={[styles.goalText, { color: secondaryTextColor }]}>{habbit.goal}</Text>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${habbit.progress * 100}%`,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)' // White with opacity for progress bar
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: textColor }]}>{Math.round(habbit.progress * 100)}%</Text>
          </View>
        </TouchableOpacity>
      </GestureDetector>
      
      {/* Delete button that appears when swiped */}
      <Animated.View style={[styles.deleteButtonContainer, deleteButtonStyle]}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => runOnJS(handleDelete)()}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habbitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    color: '#111827',
  },
  goalText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    width: 40,
    textAlign: 'right',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeableHabbitCard;