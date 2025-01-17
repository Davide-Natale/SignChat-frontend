import ThemedText from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, View } from 'react-native';

export default function Transcriptions() {
  const theme = useTheme();

  return (
    <View style={[styles.main, { backgroundColor: theme.surface }]}>
  
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