import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput } from "react-native";
import { Camera } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install @expo/vector-icons
import { router } from "expo-router";

export default function Home() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [habit, setHabit] = useState<string>("");
  const navigation = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "#f3f3f3",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Habbit</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/profile/[id]",
              params: { id: "1" },
            })
          }
        >
          <Ionicons name="person-circle" size={32} color="black" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: "100%",
          padding: 16,
          backgroundColor: "white",
          borderRadius: 10,
          shadowOpacity: 0.2,
          marginTop: 20,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Enter Your Habit:</Text>
        <TextInput
          style={{
            width: "100%",
            borderColor: "#ccc",
            borderWidth: 1,
            padding: 10,
            marginTop: 10,
            borderRadius: 5,
          }}
          placeholder="E.g., Workout, Reading"
          value={habit}
          onChangeText={setHabit}
        />
      </View>

      <TouchableOpacity
        style={{ marginTop: 20, padding: 12, backgroundColor: "blue", borderRadius: 8 }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Capture Proof</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 20, padding: 12, backgroundColor: "green", borderRadius: 8 }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Submit Habit</Text>
      </TouchableOpacity>
    </View>
  );
}
