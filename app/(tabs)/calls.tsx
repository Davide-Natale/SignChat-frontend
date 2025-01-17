import SearchBar from '@/components/SearchBar';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function Calls() {
  const theme = useTheme();
  const [filter, setFilter] = useState("");

  return (
    <ScrollView
      contentContainerStyle={[styles.main, { backgroundColor: theme.surface }]}
    >
      <View style={styles.inner}>
        <SearchBar
          value={filter}
          onChangeText={f => setFilter(f)}
          clearValue={() => setFilter("")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  inner: {
    flex: 1,
    width: "90%",
    justifyContent: "flex-start",
    alignItems: "center"
  }
});