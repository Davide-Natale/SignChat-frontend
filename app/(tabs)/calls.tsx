import SearchBar from '@/components/SearchBar';
import { useTheme } from '@/hooks/useTheme';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

export default function Calls() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const [filter, setFilter] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  useFocusEffect(
    useCallback(() => { 
      //  TODO: add fetch calls here

      const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardVisible(true);
        navigation.setOptions({
          tabBarStyle: {
            display: "none"
          }
        });
      });

      const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardVisible(false);
        navigation.setOptions({
          tabBarStyle: {
            borderTopWidth: undefined,
            backgroundColor: theme.secondary,
            elevation: 10
          }
        });
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, [scheme])
  );
  
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isKeyboardVisible ? { display: "none" } : 
        { 
          borderTopWidth: undefined, 
          backgroundColor: theme.secondary,
          elevation: 10
        }
    });
  }, [scheme]);

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