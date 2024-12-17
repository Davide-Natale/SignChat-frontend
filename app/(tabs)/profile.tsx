import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  
  return (
    <View style={[styles.main, { backgroundColor: theme.primary }]}>
      <Button 
        title='Logout' 
        color={theme.error}
        onPress={async () => {
          const success = await authContext?.logout();
          if(success) 
            router.replace("/login");
          else 
            router.replace("/login");
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
},
});