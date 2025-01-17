import ContactsCard from '@/components/ContactsCard';
import SearchBar from '@/components/SearchBar';
import { ContactsContext } from '@/contexts/ContactsContext';
import { useTheme } from '@/hooks/useTheme';
import { processContacts } from '@/utils/contactsUtils';
import { useFocusEffect } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function Contacts() {
  const theme = useTheme();
  const contactsContext = useContext(ContactsContext);
  const [filter, setFilter] = useState("");
  const { groupedContacts, unregisteredContacts } = processContacts(contactsContext?.contacts ?? []);

  useFocusEffect(useCallback(() => { contactsContext?.fetchContacts(); }, []));

  return (
    <ScrollView
      contentContainerStyle={[styles.main, { backgroundColor: theme.surface }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        <SearchBar 
          value={filter}
          onChangeText={f => setFilter(f)}
          clearValue={() => setFilter("")}
        />
        { Object.entries(groupedContacts).map(([letter, contacts], index) => (
            <ContactsCard key={index} label={letter} contacts={contacts} /> 
          ))
        }
        <ContactsCard contacts={unregisteredContacts} />
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