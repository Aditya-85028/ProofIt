import React from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { useRouter } from "expo-router";

const Welcome = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/login"); //
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Habbit</Text>
      <Text style={styles.subtitle}>now hop to it...</Text>
      <Pressable onPress={handleContinue} style={styles.button}>
        <Text style={styles.buttonText}>Tap to Continue</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#007AFF", // You might want to use your theme colors here
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Welcome;
