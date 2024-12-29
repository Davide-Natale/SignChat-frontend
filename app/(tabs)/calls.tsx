import { AppContext } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { useContext } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function Calls() {
  const theme = useTheme();
  const appContext = useContext(AppContext);

  return (
    <View style={[styles.main, { backgroundColor: theme.primary }]}>
      { appContext?.loading ? 
        <ActivityIndicator color={theme.secondaryText} size="large" /> :
        <Text style={{ color: theme.primaryText, textAlign: "center", fontFamily: "inter_bold", fontSize: 25 }}>Calls</Text>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});