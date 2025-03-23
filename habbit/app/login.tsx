import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { Slot, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

Amplify.configure(outputs);

function AuthGate() {
  const { authStatus } = useAuthenticator();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push("/home");
    }
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
          {/* <Slot /> This will only render after user is authenticated */}
        </Authenticator>
      </Authenticator.Provider>
    </SafeAreaProvider>
  );
}
