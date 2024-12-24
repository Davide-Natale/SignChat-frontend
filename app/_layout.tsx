import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/contexts/AppContext";
import { useTheme } from "@/hooks/useTheme";
import ThemedBackButton from "@/components/ThemedBackButton";


export default function RootLayout() {
  const theme = useTheme();

  return (
    <AppProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen 
            name="(auth)/login" 
            options={{
              headerStyle: { backgroundColor: theme.primary },
              headerTitle: "", 
              headerShadowVisible: false,
              headerLeft: () => <ThemedBackButton />
            }}
          />
          <Stack.Screen 
            name="(auth)/register" 
            options={{
              headerStyle: { backgroundColor: theme.primary },
              headerTitle: "", 
              headerShadowVisible: false,
              headerLeft: () => <ThemedBackButton />
            }}
          />
          <Stack.Screen 
            name="(auth)/forgot-password" 
            options={{
              headerStyle: { backgroundColor: theme.primary },
              headerTitle: "", 
              headerShadowVisible: false,
              headerLeft: () => <ThemedBackButton />
            }}
          />
          <Stack.Screen 
            name="(auth)/verify-otp" 
            options={{
              headerStyle: { backgroundColor: theme.primary },
              headerTitle: "", 
              headerShadowVisible: false,
              headerLeft: () => <ThemedBackButton />
            }}
          />
          <Stack.Screen 
            name="(auth)/reset-password" 
            options={{
              headerStyle: { backgroundColor: theme.primary },
              headerTitle: "", 
              headerShadowVisible: false,
              headerLeft: () => <ThemedBackButton />
            }}
          />
          <Stack.Screen name="(auth)/password-changed" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </AppProvider>
  );
}
