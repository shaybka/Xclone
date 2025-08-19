import "../global.css"
import { Stack } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
export default function RootLayout() {
  return <ClerkProvider
   tokenCache={tokenCache}>
      <Stack >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ClerkProvider>;
}
