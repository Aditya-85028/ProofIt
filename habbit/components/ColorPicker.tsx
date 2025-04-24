import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const Colors = [
  { id: 1, value: "#4CAF50", name: "Green" },
  { id: 2, value: "#2196F3", name: "Blue" },
  { id: 3, value: "#F44336", name: "Red" },
  { id: 4, value: "#FF9800", name: "Orange" },
  { id: 5, value: "#9C27B0", name: "Purple" },
  { id: 6, value: "#00BCD4", name: "Cyan" },
  { id: 7, value: "#FFEB3B", name: "Yellow" },
  { id: 8, value: "#795548", name: "Brown" },
];

type ColorPickerProps = {
  selectedColor: string;
  onColorSelect: (color: string) => void;
};

const ColorPicker = ({ selectedColor, onColorSelect }: ColorPickerProps) => {
  return (
    <View style={styles.colorContainer}>
      {Colors.map((color) => (
        <TouchableOpacity
          key={color.id}
          style={[
            styles.colorOption,
            { backgroundColor: color.value },
            selectedColor === color.value && styles.selectedColorOption,
          ]}
          onPress={() => onColorSelect(color.value)}
        >
          {selectedColor === color.value && <Ionicons name="checkmark" size={16} color="white" />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ColorPicker;
