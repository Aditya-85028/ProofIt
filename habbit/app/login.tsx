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
import { View, ActivityIndicator } from "react-native";

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
  
          // 🔥 Call your backend to create the user
          const res = await fetch(
            `https://y8lbtj64c9.execute-api.us-east-1.amazonaws.com/prod/create_user?user_id=${encodeURIComponent(
              userId
            )}&email=${encodeURIComponent(email)}`,
            {
              method: "POST",
            }
          );
  
          const result = await res.json();
          console.log("🗃️ User creation response:", result);
  
        } catch (error) {
          console.error("❌ Error fetching user or creating entry:", error);
        }
  
        router.push("/home");
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

  return null; // Authenticator will show login screen
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
