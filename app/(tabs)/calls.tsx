import callsAPI from '@/api/callsAPI';
import SearchBar from '@/components/SearchBar';
import ThemedButton from '@/components/ThemedButton';
import { useTheme } from '@/hooks/useTheme';
import { Call } from '@/types/Call';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import NewCallIcon from "@/assets/icons/newCall.svg";
import ThemedText from '@/components/ThemedText';
import { FlatList } from 'react-native-gesture-handler';
import { ContactsContext } from '@/contexts/ContactsContext';
import { processContacts } from '@/utils/contactsUtils';
import ContactsCard from '@/components/ContactsCard';
import CallsCard from '@/components/CallsCard';
import CallsBottomSheet from '@/components/CallsBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function Calls() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const contactsContext = useContext(ContactsContext);
  const [calls, setCalls] = useState<Call[]>([]);
  const [filter, setFilter] = useState("");
  const [tabFilter, setTabFilter] = useState("All");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const filters = ['All', 'Incoming', 'Outgoing', 'Missed'];
  const { groupedContacts, unregisteredContacts } = processContacts(contactsContext?.contacts ?? []);

  const applyCallFilter = (call: Call) => {
    if(filter === "") {
      const normalizedTabFilter = tabFilter.toLowerCase();

      if(tabFilter === "Missed") {
        return call.status === normalizedTabFilter;
      } else {
        return call.type === normalizedTabFilter;
      } 
    }

    const normalizedFilter = filter.toLowerCase().trim();
    const fullName = call.contact? `${call.contact.firstName} ${call.contact.lastName || ''}` :
      call.user? `${call.user.firstName} ${call.user.lastName || ''}` : "";
    const lastName = call.contact? call.contact.lastName :
      call.user? call.user.lastName : ""; 
    const nameParts = fullName.split(' ');

    const checkFilter = fullName.toLowerCase().startsWith(normalizedFilter) ||
      lastName?.toLowerCase().startsWith(normalizedFilter) ||
      call.phone.startsWith(filter.trim()) ||
      nameParts.some(part => part.toLowerCase().startsWith(normalizedFilter));

    return checkFilter;
  }
  
  const filteredCalls = tabFilter === "All" && filter === "" ? calls : calls.filter(call => applyCallFilter(call));

  const applyContactFilter = (firstName: string, lastName: string | null, phone: string,  filter: string) => {
    const fullName = `${firstName} ${lastName || ''}`;
    const nameParts = fullName.split(' ');

    const checkFilter = nameParts.some(part => part.toLowerCase().startsWith(filter.toLowerCase().trim())) ||
      fullName.toLowerCase().startsWith(filter.toLowerCase().trim()) ||
      lastName?.toLowerCase().startsWith(filter.toLowerCase().trim()) ||
      phone.startsWith(filter.trim());

    return checkFilter;
  };

  const filteredContacts = Object.values(groupedContacts).flatMap(contacts => (
    contacts.filter(contact => applyContactFilter(contact.firstName, contact.lastName, contact.phone, filter))
  ));

  const filteredUnregisteredContacts = unregisteredContacts.filter(contact => (
    applyContactFilter(contact.firstName, contact.lastName, contact.phone, filter)
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
          tabBarStyle: {
            borderTopWidth: undefined,
            backgroundColor: theme.secondary,
            elevation: 10
          }
        });
      });

      const fetchCalls = async () => {
        try {
          const calls = await callsAPI.getCalls();
          setCalls(calls);
        } catch (error) {
          //  No need to do anything;
        }
      };

      fetchCalls();

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
      { filter === "" ? 
        <FlatList
          horizontal
          keyboardShouldPersistTaps='handled'
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(_item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <ThemedButton
              onPress={() => setTabFilter(item)}
              height={36}
              shape='circular'
              backgroundColor={tabFilter === item ? theme.backgroundBlue : theme.onBackground}
              style={{ marginRight: index < filters.length - 1 ? 10 : undefined }}
            >
              <ThemedText
                color={tabFilter === item ? theme.textBlue : theme.secondaryText}
                fontSize={18}
                fontWeight='medium'
                style={styles.filterText}
              >
                {item}
              </ThemedText>
            </ThemedButton>
          )}
          contentContainerStyle={styles.filtersContent}
          style={styles.filtersContainer}
        /> : null
      }
      <ScrollView
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        style={styles.list}
      >
        { filter !== "" && filteredContacts.length === 0 && filteredUnregisteredContacts.length === 0 && filteredCalls.length === 0 ?
            <View style={[styles.emptyResult, { backgroundColor: theme.onSurface }]}>
              <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.message}>
                No results
              </ThemedText>
            </View> : null
        }
        { filter !== "" ? 
            <ContactsCard 
              label={"Contacts on SignChat"} 
              contacts={filteredContacts} 
              style={styles.contactsCard} 
            /> : null
        }
        <CallsCard
          label={ filter !== "" ? "Calls" : undefined }
          calls={filteredCalls} 
          style={[styles.callsCard, { marginBottom: filter !== "" && filteredUnregisteredContacts.length > 0 ? 25 : 90 }]} 
        />
        { filter !== "" ?
            <ContactsCard 
              contacts={filteredUnregisteredContacts} 
              style={styles.unregisteredContactsCard} 
            /> : null
        }
      </ScrollView>
      <CallsBottomSheet 
        ref={bottomSheetRef} 
        groupedContacts={groupedContacts} 
        unregisteredContacts={unregisteredContacts} 
      />
      {!isKeyboardVisible ?
        <View style={[styles.fab, { backgroundColor: theme.primary }]}>
          <ThemedButton
            onPress={() => bottomSheetRef.current?.present()}
            height={58}
            width={58}
            shape='circular'
            backgroundColor={theme.accent}
          >
            <NewCallIcon height={25} width={25} fill={theme.accent} style={styles.icon} />
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
  filtersContainer: {
    minHeight: 38,
    maxHeight: 38,
    marginBottom: 22,
    alignSelf: "flex-start"
  },
  filtersContent: {
    alignItems: "center", 
    justifyContent: "flex-start",
    paddingHorizontal: "5%"
  },
  filterText: {
    marginHorizontal: 25
  },
  list: {
    width: "100%"
  },
  contactsCard: {
    width: "90%", 
    alignSelf: "center",
    marginBottom: 25
  },
  callsCard: {
    width: "90%",
    alignSelf: "center"
  },
  unregisteredContactsCard: {
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