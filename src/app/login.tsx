import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { sendOTP, confirmOTP } from "../utils/auth";

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enterPhone" | "enterOTP">("enterPhone");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }
    setLoading(true);
    try {
      const response = await sendOTP(phoneNumber);
      setSession(response); // Save session for OTP verification
      setStep("enterOTP");
      Alert.alert("Success", "OTP sent to your phone!");
    } catch (error) {
      Alert.alert("Error", "ERROR SENDING OTP");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!code) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      await confirmOTP(session, code);
      Alert.alert("Success", "Logged in successfully!");
      router.push("/home"); // Navigate to the home screen
    } catch (error) {
      Alert.alert("Error", "ERROR VERIFYING OTP");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === "enterPhone" ? "Enter Phone Number" : "Enter OTP"}</Text>

      {step === "enterPhone" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Phone Number (e.g., +1234567890)"
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Sending OTP..." : "Send OTP"}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify OTP"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#FFFFFF", flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default LoginScreen;
