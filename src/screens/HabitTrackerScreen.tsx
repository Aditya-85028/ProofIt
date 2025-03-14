import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, TextInput } from "react-native";
import { Camera } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

export default function HabitTrackerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [habit, setHabit] = useState<string>("");
  const navigation = useNavigation();

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleCapturePhoto = async () => {
    if (!hasPermission) {
      await requestCameraPermission();
    }
    navigation.navigate("CameraScreen", { setCapturedPhoto });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", padding: 16, backgroundColor: "#f3f3f3" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>ProofIt!</Text>
      <View
        style={{
          width: "100%",
          padding: 16,
          backgroundColor: "white",
          borderRadius: 10,
          shadowOpacity: 0.2,
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
        onPress={handleCapturePhoto}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Capture Proof</Text>
      </TouchableOpacity>

      {capturedPhoto && (
        <Image
          source={{ uri: capturedPhoto }}
          style={{ width: 150, height: 150, marginTop: 10, borderRadius: 10 }}
        />
      )}

      <TouchableOpacity
        style={{ marginTop: 20, padding: 12, backgroundColor: "green", borderRadius: 8 }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Submit Habit</Text>
      </TouchableOpacity>
    </View>
  );
}
