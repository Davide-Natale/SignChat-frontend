import ThemedText from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, Text, View } from 'react-native';

export default function Transcriptions() {
  const theme = useTheme();

  return (
    <View style={[styles.main, { backgroundColor: theme.primary }]}>
      <ThemedText color={theme.primaryText} fontWeight='bold' fontSize={25} >
        Transcriptions
      </ThemedText>
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