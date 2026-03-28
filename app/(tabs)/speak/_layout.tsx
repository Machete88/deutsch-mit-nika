import { Stack } from 'expo-router';

export default function SpeakLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="practice" />
      <Stack.Screen name="conversation" />
    </Stack>
  );
}
