import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Authenticator,
  useAuthenticator,
} from "@aws-amplify/ui-react-native";
import { useEffect } from "react";
import { getCurrentUser, fetchUserAttributes} from "aws-amplify/auth";
import { View, ActivityIndicator, Alert } from "react-native";

Amplify.configure(outputs);

function AuthGate() {
  const { authStatus } = useAuthenticator();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      if (authStatus === "authenticated") {
        try {
          const { username, userId } = await getCurrentUser();
          const attributes = await fetchUserAttributes();
          const email = attributes?.email;

          if (!userId || !email) {
            console.warn("❌ Missing userId or email — skipping createUser call");
            return;
          }
          console.log("✅ Username:", username);
          console.log("🆔 User ID:", userId);
          console.log("📧 Email:", email);

          try {
            // First, try to check if user exists
            const checkUserResponse = await fetch(
              `https://y8lbtj64c9.execute-api.us-east-1.amazonaws.com/prod/get_user?user_id=${encodeURIComponent(userId)}`
            );
            const userData = await checkUserResponse.json();

            // If we get a 404 or an error, the user doesn't exist
            if (checkUserResponse.status === 404 || userData.detail) {
              console.log("🆕 User not found, creating new user");
              // Create new user
              const createUserResponse = await fetch(
                `https://y8lbtj64c9.execute-api.us-east-1.amazonaws.com/prod/create_user?user_id=${encodeURIComponent(userId)}&phone_number=${encodeURIComponent(email)}`,
                {
                  method: "POST",
                }
              );
              const result = await createUserResponse.json();
              console.log("🗃️ User creation response:", result);
              
              if (!createUserResponse.ok) {
                throw new Error(`Failed to create user: ${result.detail || 'Unknown error'}`);
              }
            } else {
              // User exists
              console.log("✅ User exists:", userData);
            }

            // Navigate to home regardless of whether we created or found the user
            router.push("/home");

          } catch (error) {
            console.error("❌ Error in user management:", error);
            Alert.alert(
              "Error",
              "There was a problem setting up your account. Please try again."
            );
          }
        } catch (error) {
          console.error("❌ Error fetching user attributes:", error);
          Alert.alert(
            "Error",
            "Failed to get user information. Please try again."
          );
        }
      }
    };

    handleAuth();
  }, [authStatus]);

  if (authStatus === "configuring") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

export default function Login() {
  return (
    <SafeAreaProvider>
      <Authenticator.Provider>
        <Authenticator>
          <AuthGate />
        </Authenticator>
      </Authenticator.Provider>
    </SafeAreaProvider>
  );
}