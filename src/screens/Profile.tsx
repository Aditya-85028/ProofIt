import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Welcome() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      {/* Title Section */}
      <View className="items-center space-y-4 mb-12">
        <Text className="text-4xl font-bold text-purple-600">Habbit</Text>
        <Text className="text-gray-600 text-center text-lg">hop to it</Text>
      </View>

      {/* Buttons Section */}
      <View className="w-full space-y-4">
        <TouchableOpacity
          className="bg-purple-600 w-full py-4 rounded-full"
          onPress={() => navigation.navigate("SignUp" as never)}
        >
          <Text className="text-white text-center font-semibold text-lg">Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border-2 border-purple-600 w-full py-4 rounded-full"
          onPress={() => navigation.navigate("SignIn" as never)}
        >
          <Text className="text-purple-600 text-center font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
