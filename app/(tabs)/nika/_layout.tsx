import { Stack } from 'expo-router';

export default function NikaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="live-speaking" />
      <Stack.Screen name="wardrobe" />
      <Stack.Screen name="roleplay" />
    </Stack>
  );
}
