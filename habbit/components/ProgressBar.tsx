import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ProgressBarProps {
  progress: number;
  backgroundColor?: string;
  fillColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  backgroundColor = "rgba(255, 255, 255, 0.3)",
  fillColor = "rgba(255, 255, 255, 0.8)",
}) => {
  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    flex: 1,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    width: 40,
    textAlign: "right",
  },
});

export default ProgressBar;
