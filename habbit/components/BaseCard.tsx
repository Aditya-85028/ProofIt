import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface BaseCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const BaseCard: React.FC<BaseCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
});

export default BaseCard;
