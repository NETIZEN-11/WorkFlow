import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="index"
      />
      <Stack.Screen 
        name="add-task"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="add-meeting"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
