// app/_layout.tsx
import React from 'react';
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="friends/index" options={{ headerShown: false }} />
        <Stack.Screen name="settings/index" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="habbits/index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        <Stack.Screen name="habbits/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="habbits/create" options={{ headerShown: false }} />
        <Stack.Screen name="habbits/edit/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="post" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
