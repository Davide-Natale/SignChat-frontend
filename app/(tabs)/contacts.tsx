import ContactsCard from '@/components/ContactsCard';
import SearchBar from '@/components/SearchBar';
import ThemedButton from '@/components/ThemedButton';
import { ContactsContext } from '@/contexts/ContactsContext';
import { useTheme } from '@/hooks/useTheme';
import { processContacts } from '@/utils/contactsUtils';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';
import AddUserIcon from "@/assets/icons/addUser-bold.svg";
import ThemedText from '@/components/ThemedText';
import ThemedSnackBar from '@/components/ThemedSnackBar';

export default function Contacts() {
  const theme = useTheme();
  const contactsContext = useContext(ContactsContext);
  const [filter, setFilter] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { groupedContacts, unregisteredContacts } = processContacts(contactsContext?.contacts ?? []);

  const applyNameFilter = useCallback((firstName: string, lastName: string | null, phone: string,  filter: string) => {
    const fullName = `${firstName} ${lastName || ''}`;
    const nameParts = fullName.split(' ');

    const checkFilter = nameParts.some(part => part.toLowerCase().startsWith(filter.toLowerCase().trim())) ||
      fullName.toLowerCase().startsWith(filter.toLowerCase().trim()) ||
      lastName?.toLowerCase().startsWith(filter.toLowerCase().trim()) ||
      phone.startsWith(filter.trim());

    return checkFilter;
  }, []);

  const filteredContacts = useMemo(() => 
    Object.values(groupedContacts).flatMap(contacts => (
      contacts.filter(contact => 
        applyNameFilter(contact.firstName, contact.lastName, contact.phone, filter)
      )
    )
  ), [groupedContacts, filter]);

  const filteredUnregisteredContacts = useMemo(() => 
    unregisteredContacts.filter(contact => (
      applyNameFilter(contact.firstName, contact.lastName, contact.phone, filter)
    )
  ), [unregisteredContacts, filter]);
  
  useFocusEffect(
    useCallback(() => { 
      contactsContext?.fetchContacts();

      const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardVisible(true);
      });

      const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardVisible(false);
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, [])
  );

  return (
    <View style={[styles.main, { backgroundColor: theme.surface }]}>
      <SearchBar 
        value={filter}
        onChangeText={f => setFilter(f)}
        clearValue={() => setFilter("")}
        style={styles.searchBar}
      />
      { filter !== "" ?
        ( filteredContacts.length === 0 && filteredUnregisteredContacts.length === 0 ? 
            <View style={[styles.emptyResult, { backgroundColor: theme.onSurface }]}>
              <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.message}>
                No results
              </ThemedText>
            </View> :
            <FlatList
              data={[{ label: "Contacts on SignChat", contacts: filteredContacts },
                { contacts: filteredUnregisteredContacts }
              ]}
              keyExtractor={(_item, index) => index.toString()}
              renderItem={({ item: { label, contacts } }) => (
                <ContactsCard
                  label={label}
                  contacts={contacts}
                  style={label ? styles.card : styles.footer}
                />
              )}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
            /> 
        ) :
        <FlatList
          data={Object.entries(groupedContacts)}
          keyExtractor={([letter, _contacts]) => letter}
          renderItem={({ item: [letter, contacts] }) => (
            <ContactsCard label={letter} contacts={contacts} style={styles.card} />
          )}
          ListFooterComponent={() => <ContactsCard contacts={unregisteredContacts} style={styles.footer} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
        />
      }
      { !isKeyboardVisible ? 
          <View style={[styles.fab, { backgroundColor: theme.primary }]}>
            <ThemedButton
              onPress={() => router.push('/contacts/add')}
              height={58}
              width={58}
              shape='circular'
              backgroundColor={theme.accent}
            >
              <AddUserIcon height={25} width={25} fill={theme.onAccent} style={styles.icon}/>
            </ThemedButton>
        </View> : null
      }
      <ThemedSnackBar />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  searchBar: {
    width: "90%",
    marginBottom: 22
  },
  emptyResult: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 15,
  },
  message: {
    textAlign: "center",
    marginVertical: 13
  },
  list: {
    width: "100%"
  },
  card: {
    width: "90%", 
    alignSelf: "center",
    marginBottom: 25
  },
  footer: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 90
  },
  fab: {
    height: 58,
    width: 58,
    borderRadius: 58 / 2,
    position: 'absolute',
    right: 16,
    bottom: 16
  },
  icon: {
    left: 2
  }
});