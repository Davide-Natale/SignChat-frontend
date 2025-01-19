import callsAPI from '@/api/callsAPI';
import SearchBar from '@/components/SearchBar';
import ThemedButton from '@/components/ThemedButton';
import { useTheme } from '@/hooks/useTheme';
import { Call } from '@/types/Call';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import NewCallIcon from "@/assets/icons/newCall.svg";
import ThemedText from '@/components/ThemedText';
import { FlatList } from 'react-native-gesture-handler';
import ListItem from '@/components/ListItem';
import ImageProfile from '@/components/ImageProfile';
import Divider from '@/components/Divider';
import VideoCallInLight from "@/assets/icons/videoCallIn-light.svg";
import VideoCallInDark from "@/assets/icons/videoCallIn-dark.svg";
import VideoCallOutLight from "@/assets/icons/videoCallOut-light.svg";
import VideoCallOutDark from "@/assets/icons/videoCallOut-dark.svg";
import VideoCallMissedLight from "@/assets/icons/videoCallMissed-light.svg";
import VideoCallMissedDark from "@/assets/icons/videoCallMissed-dark.svg";
import InfoIcon from "@/assets/icons/info.svg";
import { formatDate } from '@/utils/dateUtils';
import { ContactsContext } from '@/contexts/ContactsContext';
import { processContacts } from '@/utils/contactsUtils';

export default function Calls() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const contactsContext = useContext(ContactsContext);
  const [calls, setCalls] = useState<Call[]>([]);
  const [filter, setFilter] = useState("");
  const [tabFilter, setTabFilter] = useState("All");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const filters = ['All', 'Incoming', 'Outgoing', 'Missed'];
  const { groupedContacts, unregisteredContacts } = processContacts(contactsContext?.contacts ?? []);

  const applyCallFilter = (call: Call) => {
    if(filter === "") {
      if(tabFilter === "All") {
        return true;
      } else if(tabFilter === "Missed") {
        return call.status === tabFilter.toLowerCase();
      } else {
        return call.type === tabFilter.toLowerCase();
      } 
    }

    const normalizedFilter = filter.toLowerCase().trim();
    const fullName = call.contact? `${call.contact.firstName} ${call.contact.lastName || ''}` :
      call.user? `${call.user.firstName} ${call.user.lastName || ''}` : "";
    const nameParts = fullName.split(' ');
    const lastName = call.contact? call.contact.lastName :
      call.user? call.user.lastName : ""; 

    const checkFilter = nameParts.some(part => part.toLowerCase().startsWith(normalizedFilter)) ||
      fullName.toLowerCase().startsWith(normalizedFilter) ||
      lastName?.toLowerCase().startsWith(normalizedFilter) ||
      call.phone.startsWith(filter.trim());

    return checkFilter;
  }
  
  const filteredCalls = tabFilter === "All" && filter === "" ? calls : calls.filter(call => applyCallFilter(call));

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
            backgroundColor={tabFilter === item ? theme.accent : theme.onBackground}
            style={{ marginRight: index < filters.length - 1 ? 10 : undefined }}
          >
            <ThemedText
              color={tabFilter === item ? theme.onAccent : theme.secondaryText}
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
      />
      <ScrollView
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        style={styles.list}
      >
        <View style={[styles.card, { backgroundColor: theme.onSurface }]}>
          {filteredCalls.map((call, index) => {
            const iconSize = 20;
            const onPress = call.contact?.user || call.user ? () => { /* TODO: implement to call user */ } : undefined;
            const contactFullName = call.contact?.lastName ? `${call.contact.firstName} ${call.contact.lastName ?? ""}` : call.contact?.firstName;
            const userFullName = call.user ? call.user.firstName + " " + call.user.lastName : null;
            const fullNameColor = call.status === "missed" ? theme.error : theme.primaryText;
            const iconComponents = {
              light: {
                missed: VideoCallMissedLight,
                incoming: VideoCallInLight,
                outgoing: VideoCallOutLight,
              },
              dark: {
                missed: VideoCallMissedDark,
                incoming: VideoCallInDark,
                outgoing: VideoCallOutDark,
              },
            };
            
            const IconComponent = iconComponents[scheme ?? 'light'][call.status === "missed" ? "missed" : call.type];

            return (
              <React.Fragment key={call.id}>
                <ListItem
                  leadingContent={
                    <ImageProfile
                      uri={call.contact?.user ? call.contact?.user.imageProfile : call.user ? call.user.imageProfile : null}
                      size={42}
                      style={styles.image}
                    />
                  }
                  headlineContent={
                    <View>
                      <ThemedText color={fullNameColor} fontSize={15} fontWeight="medium" numberOfLines={1} >
                        {contactFullName ?? call.phone}
                      </ThemedText>
                      {userFullName ?
                        <ThemedText color={fullNameColor} fontSize={15} fontWeight='medium' numberOfLines={1}>
                          {"~" + userFullName}
                        </ThemedText> : null
                      }
                      <View style={styles.groupContainer}>
                        <IconComponent height={iconSize} width={iconSize} />
                        <ThemedText 
                          color={theme.secondaryText} 
                          fontSize={12} 
                          fontWeight='medium' 
                          numberOfLines={1} 
                          style={styles.date}
                        >
                          {formatDate(call.date)}
                        </ThemedText>
                      </View>
                    </View>
                  }
                  trailingContent={
                    <TouchableOpacity 
                      onPress={() => router.push({pathname: "/calls/[id]", params: { id: call.id }})} 
                      touchSoundDisabled 
                      activeOpacity={0.8}
                    >
                      <InfoIcon 
                        height={28} 
                        width={28} 
                        stroke={theme.primaryText} 
                        style={styles.infoIcon} 
                      />
                    </TouchableOpacity>
                    
                  }
                  onPress={onPress}
                  style={styles.row}
                />
                {index < filteredCalls.length - 1 ? <Divider height={0.5} width="83%" style={styles.divider} /> : null}
              </React.Fragment>
            );
          })
          }
        </View>
      </ScrollView>
      {!isKeyboardVisible ?
        <View style={[styles.fab, { backgroundColor: theme.primary }]}>
          <ThemedButton
            onPress={() => { /* TODO: add code to open bottomSheet */ }}
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
  filtersContainer: {
    minHeight: 38,
    maxHeight: 38,
    marginBottom: 22 
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
  card: {
    width: "90%",
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderRadius: 15,
    marginBottom: 90
  },
  row: {
    marginVertical: 8,
    paddingHorizontal: "3.5%",
  },
  image: {
    marginRight: 15
  },
  groupContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  infoIcon: {
    marginRight: 5
  },
  date: {
    marginLeft: 5
  },
  divider: {
    alignSelf: "flex-end"
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