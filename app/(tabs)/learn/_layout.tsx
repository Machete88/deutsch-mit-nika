import { Stack } from 'expo-router';

export default function LearnLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="learn-card" />
      <Stack.Screen name="grammar" />
      <Stack.Screen name="sentence-builder" />
      <Stack.Screen name="exam-mode" />
      <Stack.Screen name="exam-quiz" />
      <Stack.Screen name="exam-result" />
    </Stack>
  );
}
