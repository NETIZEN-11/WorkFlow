import { Stack } from 'expo-router';

export default function PlannerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="task-detail"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
