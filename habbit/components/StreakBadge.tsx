import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface StreakBadgeProps {
  streak: number;
  backgroundColor?: string;
  textColor?: string;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ 
  streak, 
  backgroundColor = 'rgba(255, 255, 255, 0.2)',
  textColor = '#FFFFFF' 
}) => {
  return (
    <View style={[styles.streakBadge, { backgroundColor }]}>
      <Ionicons name="flame" size={16} color={textColor} />
      <Text style={[styles.streakText, { color: textColor }]}>{streak}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default StreakBadge;