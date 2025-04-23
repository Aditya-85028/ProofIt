// API utility functions for making requests to the backend

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? "https://y8lbtj64c9.execute-api.us-east-1.amazonaws.com/prod"
  : "http://localhost:8000";

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
 * Create a new post with an image and required habit link
 * @param userId - The user's unique ID
 * @param photoUri - The URI of the photo to upload
 * @param comment - User's comment for the post
 * @param habitId - Habit ID to link the post to
 * @returns Promise with the created post data
 */
export const createPost = async (
  userId: string,
  photoUri: string,
  comment: string,
  habitId: string
) => {
  try {
    // Create form data for the image upload
    const formData = new FormData();
    
    // Add the image file
    const filename = photoUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('file', {
      uri: photoUri,
      name: filename,
      type,
    } as any);

    // Add other post data
    const queryParams = new URLSearchParams({
      user_id: userId,
      comments: comment,  // Keep this as 'comments' for now
      habit_id: habitId
    });

    // Log the query parameters for debugging
    console.log('Creating post with params:', {
      user_id: userId,
      comments: comment,
      habit_id: habitId
    });

    // Send the request
    const response = await fetch(`${API_BASE_URL}/create_post?${queryParams.toString()}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Response:', errorData);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

/**
 * Fetch posts for a specific user
 * @param userId - The user's unique ID
 * @param habitId - Optional habit ID to filter posts
 * @returns Promise with the posts data
 */
export const fetchUserPosts = async (userId: string, habitId?: string) => {
  try {
    let url = `${API_BASE_URL}/get_posts?user_id=${userId}`;
    if (habitId) {
      url += `&habit_id=${habitId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching posts:", error);
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

export const deletePost = async (userId: string, postId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete_post`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        post_id: postId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const createComment = async (
  postId: string,
  userId: string,
  text: string,
  parentId?: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create_comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
        user_id: userId,
        text,
        parent_id: parentId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const getComments = async (postId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_comments/${postId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const likePost = async (postId: string, userId: string) => {
  try {
    console.log('Attempting to like/unlike post:', { postId, userId });
    const response = await fetch(
      `${API_BASE_URL}/like_post?post_id=${postId}&user_id=${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Like post failed:', errorText);
      throw new Error(`Failed to like post: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Like post response:', data);
    return data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const getPostLikes = async (postId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/get_post_likes/${postId}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error getting post likes:', error);
    throw error;
  }
};
export const checkUserLike = async (postId: string, userId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/check_user_like/${postId}/${userId}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error checking user like:', error);
    throw error;
  }
};
