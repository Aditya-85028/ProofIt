import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { fetchUserHabits, createPost } from '../../utils/api';
import { API_BASE_URL } from '../../utils/api';
import { getCurrentUser } from "aws-amplify/auth";

type Habit = {
  habit_id: string;
  habit_name: string;
  color: string;
};

export default function CreatePostScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const [comment, setComment] = useState('');
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState("");
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    // Get the authenticated user and load their habits
    const fetchUserAndHabits = async () => {
      setIsUserLoading(true);
      try {
        // Get the current user's ID
        const { userId: currentUserId } = await getCurrentUser();
        setUserId(currentUserId);
        
        // Now load the user's habits
        setIsLoading(true);
        const response = await fetchUserHabits(currentUserId);
        if (response && response.habits) {
          setHabits(response.habits);
        }
      } catch (error) {
        console.error('Error loading user or habits:', error);
        Alert.alert(
          "Error",
          "Unable to load your habits. Please try again later.",
          [{ text: "OK", onPress: () => router.replace('/home') }]
        );
      } finally {
        setIsUserLoading(false);
        setIsLoading(false);
      }
    };

    fetchUserAndHabits();
  }, []);

  const handleSubmit = async () => {
    if (!photoUri) {
      alert('No photo selected');
      return;
    }

    if (!selectedHabit) {
      alert('Please select a habit to link this post to');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the createPost API function
      const result = await createPost(
        userId,
        photoUri,
        comment,
        selectedHabit
      );
      
      console.log('Post created:', result);
      
      // Show success message before navigating to home
      Alert.alert(
        "Success",
        "Your post has been created successfully!",
        [{ text: "OK", onPress: () => router.replace('/home') }]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading indicator while fetching user data
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.postButton, isSubmitting && styles.disabledButton]}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text>No image selected</Text>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Add a caption</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Link to a habit</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : habits.length > 0 ? (
            <View style={styles.habitsContainer}>
              {habits.map((habit) => (
                <TouchableOpacity
                  key={habit.habit_id}
                  style={[
                    styles.habitItem,
                    { borderColor: habit.color || '#4CAF50' },
                    selectedHabit === habit.habit_id && styles.selectedHabit,
                  ]}
                  onPress={() => setSelectedHabit(habit.habit_id)}
                >
                  <Text style={styles.habitName}>{habit.habit_name}</Text>
                  {selectedHabit === habit.habit_id && (
                    <Ionicons name="checkmark-circle" size={20} color={habit.color || '#4CAF50'} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noHabitsContainer}>
              <Text style={styles.noHabitsText}>You don't have any habits yet</Text>
              <TouchableOpacity 
                style={styles.createHabitButton}
                onPress={() => router.push('/habbits/create')}
              >
                <Text style={styles.createHabitButtonText}>Create a Habit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4CAF50",
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  habitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedHabit: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  habitName: {
    marginRight: 8,
    fontWeight: '500',
  },
  noHabitsText: {
    fontStyle: 'italic',
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
  noHabitsContainer: {
    alignItems: 'center',
    padding: 16,
  },
  createHabitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  createHabitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});