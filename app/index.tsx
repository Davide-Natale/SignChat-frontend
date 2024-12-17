import { Text, View, StyleSheet, Button } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useRouter, Redirect } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const theme = useTheme();
  const authContext = useContext(AuthContext);

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
    <View style={[styles.main, { backgroundColor: theme.primary }]}>
      <Text style={[styles.title, { color: theme.accent}]}>Welcome</Text>
      <View style={styles.buttons_group}> 
        <Button title="Login" onPress={() => { router.push('/login') }} color={theme.accent} />
        <Button title="Sign Up" onPress={() => { router.push('/register') }} />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontFamily: "inter_bold",
    fontSize: 20,
    paddingBottom: 10
  },
  buttons_group: {
    display: "flex",
    flexDirection: "row",
  }
});