import { Stack } from "expo-router";

export default function OrderConfirmationLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
