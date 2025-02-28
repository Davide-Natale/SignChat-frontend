import { View, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "@/hooks/useTheme";
import { useRouter, Redirect } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import * as SplashScreen from 'expo-splash-screen';
import ThemedText from "@/components/ThemedText";
import ThemedButton from "@/components/ThemedButton";
import { AppContext } from "@/contexts/AppContext";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const appContext = useContext(AppContext);
  const authContext = useContext(AuthContext);
  const description = "Break down communication barriers effortlessly. " +
    "Connect, communicate and engage like never before!";

  useEffect(() => {
    if (appContext?.isReady) SplashScreen.hideAsync();
  }, [appContext?.isReady]);

  if (!appContext?.isReady) {
    return null;
  }

  if (authContext?.isAuthenticated) {
    //return <Redirect href="/calls" />;
    return <Redirect href={{ pathname: "/video-call", params: { userId: 2 } }} />;
  }

  return (
    <SafeAreaView style={[styles.main, { backgroundColor: theme.primary }]}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <View style={styles.container1}>
          <Image
            source={colorScheme === "dark" ? require("@/assets/images/welcome-dark.png") :
              require("@/assets/images/welcome-light.png")}
            style={styles.image}
          />
          <ThemedText color={theme.primaryText} fontSize={27} fontWeight="extrabold" style={styles.title}>
            Welcome to SignChat!
          </ThemedText>
          <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="medium" style={styles.description}>
            {description}
          </ThemedText>
        </View>
        <View style={styles.container2}>
          <ThemedButton
            onPress={() => router.push("/register")}
            height={60}
            width="100%"
            backgroundColor={theme.accent}
            style={styles.button}
          >
            <ThemedText color={theme.onAccent} fontSize={20} fontWeight="bold" >Get Started</ThemedText>
          </ThemedButton>
          <View style={styles.textGroup}>
            <ThemedText color={theme.secondaryText} fontSize={14} fontWeight='medium'>
              Already have an account?
            </ThemedText>
            <TouchableOpacity 
              onPress={() => { router.push("/login"); }} 
              touchSoundDisabled 
              activeOpacity={0.8}
            >
              <ThemedText color={theme.accent} fontSize={14} fontWeight='semibold' style={styles.text}>Login</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1
  },
  inner: {
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center"
  },
  container1: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center"
  },
  container2: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: "90%",
    aspectRatio: 1,
    marginTop: 35,
    marginBottom: 60
  },
  title: {
    textAlign: "center",
    letterSpacing: 0.2
  },
  description: {
    textAlign: "center",
    letterSpacing: 0.2,
    marginTop: 10
  },
  button: {
    marginTop: 100,
    marginBottom: 15,
  },
  textGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  text: {
    marginLeft: 5
  }
});