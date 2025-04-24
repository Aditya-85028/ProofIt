import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

type LoadingStateProps = {
  message?: string;
};

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#4CAF50" />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: "#4CAF50",
  },
});

export default LoadingState;
