import ContactsCard from '@/components/ContactsCard';
import SearchBar from '@/components/SearchBar';
import ThemedButton from '@/components/ThemedButton';
import { ContactsContext } from '@/contexts/ContactsContext';
import { useTheme } from '@/hooks/useTheme';
import { processContacts } from '@/utils/contactsUtils';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, useColorScheme, View } from 'react-native';
import AddUserIcon from "@/assets/icons/addUser-bold.svg";
import { ScrollView } from 'react-native-gesture-handler';

export default function Contacts() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const contactsContext = useContext(ContactsContext);
  const [filter, setFilter] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { groupedContacts, unregisteredContacts } = processContacts(contactsContext?.contacts ?? []);

  const applyNameFilter = (firstName: string, lastName: string | null, phone: string,  filter: string) => {
    const fullName = `${firstName} ${lastName || ''}`;
    const nameParts = fullName.split(' ');

    const checkFilter = nameParts.some(part => part.toLowerCase().startsWith(filter.toLowerCase())) ||
      fullName.toLowerCase().startsWith(filter.toLowerCase()) ||
      lastName?.toLowerCase().startsWith(filter.toLowerCase()) ||
      phone.startsWith(filter);

    return checkFilter;
  };

  const filteredContacts = Object.values(groupedContacts).flatMap(contacts => (
    contacts.filter(contact => applyNameFilter(contact.firstName, contact.lastName, contact.phone, filter))
  ));

  const filteredUnregisteredContacts = unregisteredContacts.filter(contact => (
    applyNameFilter(contact.firstName, contact.lastName, contact.phone, filter)
  ));
  
  useFocusEffect(
    useCallback(() => { 
      contactsContext?.fetchContacts();

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
          tabBarStyle:  { 
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
    <View style={[styles.main, { backgroundColor: theme.surface }]}>
      <SearchBar 
        value={filter}
        onChangeText={f => setFilter(f)}
        clearValue={() => setFilter("")}
        style={styles.searchBar}
      />
      { filter !== "" ?  
          <ScrollView style={styles.list}
            keyboardShouldPersistTaps="handled"
          >
            <ContactsCard label={"Contacts on SignChat"} contacts={filteredContacts} style={styles.card} />
            { filteredUnregisteredContacts.length > 0 ?
                <ContactsCard contacts={filteredUnregisteredContacts} style={styles.footer} /> : null 
            } 
          </ScrollView> :
          <FlatList
            data={Object.entries(groupedContacts)}
            keyExtractor={([letter, _contacts]) => letter}
            renderItem={({ item: [letter, contacts] }) => (
              <ContactsCard label={letter} contacts={contacts} style={styles.card} />
            )}
            ListFooterComponent={() => (
              unregisteredContacts.length > 0 ?
                <ContactsCard contacts={unregisteredContacts} style={styles.footer} /> : null
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
          />
      }
      { !isKeyboardVisible ? 
          <View style={[styles.fab, { backgroundColor: theme.primary }]}>
            <ThemedButton
              onPress={() => { /**TODO: add navigatio to add contact route */ }}
              height={58}
              width={58}
              shape='circular'
              backgroundColor={theme.accent}
            >
              <AddUserIcon height={25} width={25} fill={theme.onAccent} style={styles.icon}/>
            </ThemedButton>
        </View> : null
      }
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
    marginBottom: 20
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