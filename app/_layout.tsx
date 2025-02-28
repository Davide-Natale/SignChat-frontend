import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/contexts/AppContext";
import { useTheme } from "@/hooks/useTheme";
import ThemedBackButton from "@/components/ThemedBackButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import { ContactsProvider } from "@/contexts/ContactsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { VideoCallProvider } from "@/contexts/VideoCallContext";

export default function RootLayout() {
  const theme = useTheme();
  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#2C2C2C',
      onSurfaceVariant: '#FFFFFF',
      onSurfaceDisabled: theme.onBackground
    },
  };

  return (
    <PaperProvider theme={customTheme}>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <AppProvider>
            <NotificationsProvider>
              <ErrorProvider>
                <ContactsProvider>
                  <AuthProvider>
                    <VideoCallProvider>
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
                        <Stack.Screen
                          name="profile/edit"
                          options={{
                            headerTitle: "Edit Profile",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                              fontFamily: "inter_bold",
                              fontSize: 19,
                              color: theme.primaryText
                            },
                            headerStyle: { backgroundColor: theme.primary },
                            headerShadowVisible: false,
                            headerLeft: () => <ThemedBackButton />
                          }}
                        />
                        <Stack.Screen
                          name="profile/change-password"
                          options={{
                            headerTitle: "",
                            headerStyle: { backgroundColor: theme.primary },
                            headerShadowVisible: false,
                            headerLeft: () => <ThemedBackButton />
                          }}
                        />
                        <Stack.Screen
                          name="contacts/[id]/info"
                          options={{
                            headerTitle: "Info Contact",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                              fontFamily: "inter_bold",
                              fontSize: 19,
                              color: theme.primaryText
                            },
                            headerStyle: { backgroundColor: theme.surface },
                            headerShadowVisible: false,
                            headerLeft: () => <ThemedBackButton />
                          }}
                        />
                        <Stack.Screen
                          name="contacts/[id]/edit"
                          options={{
                            headerTitle: "Edit Contact",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                              fontFamily: "inter_bold",
                              fontSize: 19,
                              color: theme.primaryText
                            },
                            headerStyle: { backgroundColor: theme.primary },
                            headerShadowVisible: false,
                            headerLeft: () => <ThemedBackButton />,
                          }}
                        />
                        <Stack.Screen
                          name="contacts/add"
                          options={{
                            headerTitle: "New Contact",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                              fontFamily: "inter_bold",
                              fontSize: 19,
                              color: theme.primaryText
                            },
                            headerStyle: { backgroundColor: theme.primary },
                            headerShadowVisible: false,
                            headerLeft: () => <ThemedBackButton />,
                          }}
                        />
                        <Stack.Screen
                          name="users/[id]"
                          options={{
                            headerTitle: "Info User",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                              fontFamily: "inter_bold",
                              fontSize: 19,
                              color: theme.primaryText
                            },
                            headerStyle: { backgroundColor: theme.surface },
                            headerShadowVisible: false,
                            headerLeft: () => <ThemedBackButton />
                          }}
                        />
                        <Stack.Screen
                          name="calls/[id]"
                          options={{
                            headerTitle: "Info Call",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                              fontFamily: "inter_bold",
                              fontSize: 19,
                              color: theme.primaryText
                            },
                            headerStyle: { backgroundColor: theme.surface },
                            headerShadowVisible: false,
                            headerLeft: () => <ThemedBackButton />
                          }}
                        />
                        <Stack.Screen 
                          name="video-call/index" 
                          options={{
                            headerShown: false,
                            orientation: 'portrait'
                          }} 
                        />
                        <Stack.Screen
                          name="video-call/incoming"
                          options={{
                            headerShown: false,
                            orientation: 'portrait'
                          }}
                        />
                      </Stack>
                      <StatusBar style="auto" />
                    </VideoCallProvider>
                  </AuthProvider>
                </ContactsProvider>
              </ErrorProvider>
            </NotificationsProvider>
          </AppProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}
