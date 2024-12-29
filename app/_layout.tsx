import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/contexts/AppContext";
import { useTheme } from "@/hooks/useTheme";
import ThemedBackButton from "@/components/ThemedBackButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  const theme = useTheme();

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
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
                name="(auth)/complete-profile"
                options={{
                  headerTitle: "Complete Profile",
                  headerTitleAlign: "center",
                  headerTitleStyle: {
                    fontFamily: "inter_bold",
                    fontSize: 19,
                    color: theme.primaryText
                  },
                  headerStyle: { backgroundColor: theme.primary },
                  headerShadowVisible: false
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
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
