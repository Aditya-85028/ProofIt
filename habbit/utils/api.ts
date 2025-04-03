// API utility functions for making requests to the backend

const API_BASE_URL = "http://localhost:8000"; // Change to API gateway url during production!

/**
 * Fetch habits for a specific user
 * @param userId - The user's unique ID
 * @returns Promise with the habits data
 */
export const fetchUserHabits = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_habit?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching habits:", error);
    throw error;
  }
};

/**
 * Delete a habit for a specific user
 * @param userId - The user's unique ID
 * @param habitId - The habit's unique ID
 * @returns Promise with the deletion status
 */
export const deleteUserHabit = async (userId: string, habitId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete_habit?user_id=${userId}&habit_id=${habitId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }
};

/**
 * Update a habit for a specific user
 * @param userId - The user's unique ID
 * @param habitId - The habit's unique ID
 * @param habitName - The updated habit name
 * @param cadence - The updated cadence (frequency)
 * @param color - The updated color
 * @returns Promise with the update status
 */
export const updateUserHabit = async (
  userId: string, 
  habitId: string, 
  habitName: string, 
  cadence: string, 
  color: string
) => {
  try {
    const queryParams = new URLSearchParams({
      user_id: userId,
      habit_id: habitId,
      habit_name: habitName,
      cadence: cadence,
      color: color
    }).toString();
    
    const response = await fetch(`${API_BASE_URL}/update_habit?${queryParams}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
};