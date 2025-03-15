import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";

const Welcome = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/home"); // This will navigate to the tabs layout, which starts with Home
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title} type="title">
        Welcome to Habbit
      </ThemedText>
      <ThemedText style={styles.subtitle}>now hop to it...</ThemedText>
      <Pressable onPress={handleContinue} style={styles.button}>
        <ThemedText style={styles.buttonText}>Tap to Continue</ThemedText>
      </Pressable>
    </ThemedView>
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
