import { Text, View, StyleSheet, Button } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "@/hooks/useTheme";
import { useRouter, Redirect } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import * as SplashScreen from 'expo-splash-screen';
import ThemedText from "@/components/ThemedText";
import ThemedButton from "@/components/ThemedButton";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const description = "Break down communication barrier seffortlessly. " + 
    "Connect, communicate and engage like never before!";

  useEffect(() => {
    if(authContext?.isReady) SplashScreen.hideAsync();
    
  }, [authContext?.isReady]);

  if(!authContext?.isReady) {
    return <View style={{ backgroundColor: theme.primary }}></View>;
  }

  if (authContext?.isAuthenticated) {
    return <Redirect href="/calls" />;
  }

  

  return (
    <SafeAreaView style={[styles.main, { backgroundColor: theme.primary }]}>
      <View style={styles.container1}>
        <Image 
          source={require("@/assets/images/icon.png")} 
          style={styles.image} 
        />
        <ThemedText color={theme.primaryText} fontSize={28} fontWeight="extrabold" style={styles.title}>
          Welcome to SignChat!
        </ThemedText>
        <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="medium" style={styles.description}>
          {description}
        </ThemedText>
      </View>
      <View style={styles.container2}>
        <ThemedButton
          onPress={() => router.push("/login")}
          height={60}
          width="100%"
          shape="circular"
          backgroundColor={theme.accent}
          style={styles.button1}
        >
          <ThemedText color={theme.onAccent} fontSize={18} fontWeight="bold" >Login</ThemedText>
        </ThemedButton>
        <ThemedButton
          onPress={() => router.push("/register")}
          height={60}
          width="100%"
          type="outlined"
          shape="circular"
          borderColor={theme.accent}
          backgroundColor={theme.primary}
          style={styles.button2}
        >
          <ThemedText color={theme.accent} fontSize={18} fontWeight="bold" >Create an Account</ThemedText>
        </ThemedButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  container1: {
    flex: 2, 
    width: "85%",
    justifyContent: "flex-start", 
    alignItems: "center"
  },
  container2: {
    flex: 1,
    width: "85%",
    justifyContent: "flex-end", 
    alignItems: "center"
  },
  image: {
    height: 170,
    width: 170,
    borderRadius: 35,
    elevation: 10,
    marginVertical: 90
  },
  title: {
    textAlign: "center",
    letterSpacing: 1.5
  },
  description: {
    textAlign: "center",
    letterSpacing: 1.5,
    marginVertical: 5
  },
  button1: {
    marginBottom: 12
  },
  button2: {
    marginTop: 12,
    marginBottom: 40
  }
});