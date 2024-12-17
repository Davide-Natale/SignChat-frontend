import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import profileAPI, { User } from '@/api/profileAPI';  //  TODO: move this type to a type folder
import { isAxiosError } from 'axios';

export default function ProfileScreen() {
  const theme = useTheme();
  const [user, setUser] = useState<User>();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    profileAPI.getProfile()
      .then(u => { setUser(u); })
      .catch(err => { if(isAxiosError(err)) console.log(err.response?.data.message); })
  }, []);
  
  return (
    <View style={[styles.main, { backgroundColor: theme.primary }]}>
      <View style={{ flexDirection: "row", margin: 20 }}>
        <Text style={[styles.title, { color: theme.primaryText }]}>Email:</Text>
        <Text style={[styles.text, { color: theme.secondaryText }]}>{user?.email}</Text>
      </View>
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
  title: {
    fontFamily: 'inter_bold',
    fontSize: 18, 
    marginRight: 10
  },
  text: {
    fontFamily: 'inter_regular',
    fontSize: 18,
  }
});