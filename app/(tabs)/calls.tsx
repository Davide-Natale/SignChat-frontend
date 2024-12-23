import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, Text, View } from 'react-native';

export default function CallsScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.main, { backgroundColor: theme.primary }]}>
      <Text>Calls</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1
  }
});