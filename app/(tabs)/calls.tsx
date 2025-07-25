import callsAPI from '@/api/callsAPI';
import SearchBar from '@/components/SearchBar';
import ThemedButton from '@/components/ThemedButton';
import { useTheme } from '@/hooks/useTheme';
import { Call } from '@/types/Call';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, TextInput, useColorScheme, View } from 'react-native';
import NewCallIcon from "@/assets/icons/newCall.svg";
import NewCallIconLight from '@/assets/icons/newCall-light.svg';
import NewCallIconDark from '@/assets/icons/newCall-dark.svg';
import ThemedText from '@/components/ThemedText';
import { FlatList } from 'react-native-gesture-handler';
import { ContactsContext } from '@/contexts/ContactsContext';
import { processContacts } from '@/utils/contactsUtils';
import ContactsCard from '@/components/ContactsCard';
import CallsCard from '@/components/CallsCard';
import CallsBottomSheet from '@/components/CallsBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Checkbox } from 'react-native-paper';
import OptionsMenu from '@/components/OptionsMenu';
import ThemedTextButton from '@/components/ThemedTextButton';
import EditIcon from '@/assets/icons/edit.svg';
import TrashIcon from '@/assets/icons/trash.svg';
import AlertDialog from '@/components/AlertDialog';
import ThemedSnackBar from '@/components/ThemedSnackBar';
import { AppContext } from '@/contexts/AppContext';
import { ErrorContext } from '@/contexts/ErrorContext';
import { Contact } from '@/types/Contact';
import { VideoCallContext } from '@/contexts/VideoCallContext';

export default function Calls() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const appContext = useContext(AppContext);
  const errorContext = useContext(ErrorContext);
  const contactsContext = useContext(ContactsContext);
  const videoCallContext = useContext(VideoCallContext);
  const [calls, setCalls] = useState<Call[]>([]);
  const [filter, setFilter] = useState("");
  const [tabFilter, setTabFilter] = useState("All");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCalls, setSelectedCalls] = useState<number[]>([]);
  const textInputRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const filters = useMemo(() => ['All', 'Incoming', 'Outgoing', 'Missed'], []);
  const { groupedContacts, unregisteredContacts } = processContacts(contactsContext?.contacts ?? []);

  const applyCallFilter = useCallback((call: Call) => {
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
  }, [tabFilter, filter]);
  
  const filteredCalls = useMemo(() => 
    tabFilter === "All" && filter === "" ? calls : 
    calls.filter(call => applyCallFilter(call)
  ), [tabFilter, filter, calls]);

  const applyContactFilter = useCallback((firstName: string, lastName: string | null, phone: string, filter: string) => {
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
        applyContactFilter(contact.firstName, contact.lastName, contact.phone, filter)
      )
    )
  ), [groupedContacts, filter]);

  const filteredUnregisteredContacts = useMemo(() => 
    unregisteredContacts.filter(contact => (
      applyContactFilter(contact.firstName, contact.lastName, contact.phone, filter)
    )
  ), [unregisteredContacts, filter]);

  const openMenu = useCallback(() => setVisible(true), []);

  const closeMenu = useCallback(() => setVisible(false),[]);

  const checkSelected = useCallback((id: number) => {
    return selectedCalls.includes(id);
  }, [selectedCalls]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedCalls((prevSelected) =>
      prevSelected.includes(id) ?
        prevSelected.filter((callId) => callId !== id) :
        [...prevSelected, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedCalls.length === filteredCalls.filter(call => call.status !== 'ongoing').length) {
      setSelectedCalls([]);
    } else {
      setSelectedCalls(filteredCalls
        .filter(call => call.status !== 'ongoing')
        .map((call) => call.id)
      );
    }
  }, [selectedCalls, filteredCalls]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (isEdit ?
        <ThemedTextButton 
          text='Cancel'
          includeLoading={false}
          onPress={() => { setSelectedCalls([]) ; setIsEdit(false) }}
          style={styles.cancelButton}
        /> : null
      ),
      headerRight: () => (!isEdit ? 
        <OptionsMenu 
          visible={visible}
          openMenu={openMenu}
          closeMenu={closeMenu}
          options={
            [
              { 
                title: 'Edit',
                color: theme.primaryText,
                trailingIcon: <EditIcon height={22} width={22} stroke={theme.primaryText} />,
                onPress: () => { 
                  setTabFilter('All'); 
                  setFilter("");
                  textInputRef.current?.blur();
                  setIsEdit(true);
                }
              },
              { 
                title: 'Clear All',
                color: theme.error,
                trailingIcon: <TrashIcon height={22} width={22} stroke={theme.error} />,
                onPress: () => { closeMenu() ; setShowDialog(true)  }
              }
            ]}
            style={styles.optionsIcon}
        /> : 
          <ThemedTextButton 
            text='Delete' 
            onPress={async () => {
              if(selectedCalls.length === 0) {
                return setIsEdit(false);
              }

              try {
                errorContext?.clearErrMsg();
                appContext?.updateLoading(true);
                await callsAPI.deleteCalls(selectedCalls);
              } catch (error) {
                errorContext?.handleError(error);
              } finally {
                appContext?.updateLoading(false);
                setIsEdit(false); 
                setSelectedCalls([]);
                fetchCalls();
              }  
            }} 
            style={styles.deleteButton}
          />
      )
    });
  }, [isEdit, visible, selectedCalls]);

  const fetchCalls = useCallback(async () => {
    try {
      errorContext?.clearErrMsg();
      const calls = await callsAPI.getCalls();
      setCalls(calls);
    } catch (error) {
      errorContext?.handleError(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      contactsContext?.fetchContacts();

      const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardVisible(true);
      });

      const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardVisible(false);
      });

      fetchCalls();

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, [scheme])
  );

  return (
    <View style={[styles.main, { backgroundColor: theme.surface }]}>
      <SearchBar
        externalRef={textInputRef}
        value={filter}
        onChangeText={f => setFilter(f)}
        clearValue={() => setFilter("")}
        action={() => { setIsEdit(false) ; setSelectedCalls([]) }}
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
              onPress={() => { setIsEdit(false) ; setSelectedCalls([]) ; setTabFilter(item) }}
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
          style={[styles.filtersContainer, { marginBottom: !isEdit ? 22 : 12 }]}
        /> : null
      }
      { isEdit ? 
        <View style={styles.checkbox}>
            <ThemedText
              color={theme.secondaryText}
              fontSize={15}
              fontWeight='medium'
            >
              All:
            </ThemedText>
            <Checkbox 
              status={ selectedCalls.length === 0 ? 'unchecked' : 
                selectedCalls.length === filteredCalls
                  .filter(call => call.status !== 'ongoing').length ? 'checked' : 
                'indeterminate'
              }
              onPress={toggleSelectAll}
              uncheckedColor={theme.divider}
              color={theme.accent}            
            />
        </View> : null
      }
      { filter === "" && calls.length === 0 ?
        <ScrollView 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.list} 
        >
          <View style={styles.emptyMessageContainer}>
            <ThemedText color={theme.secondaryText} fontSize={18} fontWeight="medium" style={styles.emptyMessage}>
              {"To start a video call with your contacts on SignChat, tap "}
              <View style={styles.emptyMessageIcon}>
                {scheme === "dark" ?
                  <NewCallIconDark fill={theme.surface} /> :
                  <NewCallIconLight fill={theme.surface} />
                }
              </View>
              {" at the bottom."}
            </ThemedText>
          </View>
        </ScrollView>
         : null
      }
      {filter !== "" && filteredContacts.length === 0 && filteredUnregisteredContacts.length === 0 && filteredCalls.length === 0 ?
        <View style={[styles.emptyResult, { backgroundColor: theme.onSurface }]}>
          <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.message}>
            No results
          </ThemedText>
        </View> : null
      }

      <FlatList
        data={[
            { label: "Contacts on SignChat", values: filter !== "" ? filteredContacts : [] },
            { label: (filter !== "" ? "Calls" : undefined), values: filteredCalls },
            { values: filter !== "" ? filteredUnregisteredContacts : [] }
        ]}
        keyExtractor={(_item, index) => index.toString()}
        renderItem={({ item: { label, values }, index }) => (
          index === 1 ? 
            <CallsCard
              isEdit={isEdit}
              label={label}
              calls={values as Call[]}
              onEditAction={isEdit ? toggleSelection : undefined}
              checkSelected={checkSelected}
              style={[styles.callsCard, { marginBottom: filter !== "" || isKeyboardVisible || isEdit ? 25 : 90 }]}
            /> :
            <ContactsCard 
              label={label} 
              contacts={values as Contact[]}
              videoCallContext={videoCallContext}
              style={label ? styles.contactsCard : styles.unregisteredContactsCard}
            />
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.list}
      />
      <AlertDialog
        showDialog={showDialog}
        title='Clear Call History'
        content='Are you sure to clear your call history?'
        confirmText='Clear'
        onConfirm={async () => {
          try {
            errorContext?.clearErrMsg();
            appContext?.updateLoading(true);
            await callsAPI.deleteCalls(calls.map(call => call.id));
          } catch (error) {
            errorContext?.handleError(error);
          } finally {
            appContext?.updateLoading(false);
            setShowDialog(false);
            fetchCalls();
          }
        }}
        onDismiss={() => setShowDialog(false)}
      />
      <ThemedSnackBar />
      <CallsBottomSheet 
        ref={bottomSheetRef} 
        groupedContacts={groupedContacts} 
        unregisteredContacts={unregisteredContacts} 
      />
      {!isKeyboardVisible && !isEdit ?
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
  emptyMessageContainer: {
    width: "80%", 
    alignSelf: "center", 
    marginVertical: "50%"
  },
  emptyMessage: {
    textAlign: "center"
  },
  emptyMessageIcon: {
    height: 10,
    justifyContent: "center", 
    alignItems: "center"
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
  },
  cancelButton: {
    marginLeft: 20
  },
  deleteButton: {
    marginRight: 20
  },
  checkbox: {
    width: "90%",
    flexDirection: 'row', 
    justifyContent: "flex-start", 
    alignItems: "center",
    paddingHorizontal: 8
  },
  optionsIcon: {
    marginRight: 17
  },
});