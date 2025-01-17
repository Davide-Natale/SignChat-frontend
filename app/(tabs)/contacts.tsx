import ThemedText from '@/components/ThemedText';
import { ContactsContext } from '@/contexts/ContactsContext';
import { useTheme } from '@/hooks/useTheme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export default function Contacts() {
  const theme = useTheme();
  const contactsContext = useContext(ContactsContext);

  useFocusEffect(useCallback(() => { contactsContext?.fetchContacts(); }, []));

  useEffect(() => { contactsContext?.contacts.forEach((c) => console.log(c.firstName + ' ' + c.lastName)) }, [contactsContext?.contacts])

  return (
    <View style={[styles.main, { backgroundColor: theme.primary }]}>
      <ThemedText color={theme.primaryText} fontWeight='bold' fontSize={25} >
        Contacts
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