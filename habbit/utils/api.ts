// API utility functions for making requests to the backend

const API_BASE_URL = "http://localhost:8000"; // Change this to your actual API URL in production

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