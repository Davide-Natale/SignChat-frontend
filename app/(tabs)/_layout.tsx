import { Tabs } from "expo-router";
import CallIcon from '@/assets/icons/call.svg';
import CallIconBold from '@/assets/icons/call-bold.svg';
import ContactIcon from '@/assets/icons/contact.svg';
import ContactIconBold from '@/assets/icons/contact-bold.svg';
import TranscriptionIcon from '@/assets/icons/transcription.svg';
import TranscriptionIconBold from '@/assets/icons/transcription-bold.svg';
import { useTheme } from "@/hooks/useTheme";
import { useCallback, useContext, useEffect } from "react";
import { AppContext } from "@/contexts/AppContext";
import { AuthContext } from "@/contexts/AuthContext";
import ImageProfile from "@/components/ImageProfile";
import * as Contacts from 'expo-contacts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Contact } from "@/types/Contact";
import contactsAPI from "@/api/contactsAPI";
import { ContactsContext } from "@/contexts/ContactsContext";
import { connectSocket, disconnectSocket } from "@/utils/webSocket";
import { NotificationsContext } from "@/contexts/NotificationsContext";
import { checkInitialNotification } from "@/utils/notifications";

type CustomContact = Omit<Contact, "id" | "user">;

export default function TabLayout() {
    const theme = useTheme();
    const appContext = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const contactsContext = useContext(ContactsContext);
    const notificationsContext = useContext(NotificationsContext);

    const getLocalContacts = useCallback(async () => {
        const { status } = await Contacts.requestPermissionsAsync();

        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [
                    Contacts.Fields.FirstName, 
                    Contacts.Fields.LastName, 
                    Contacts.Fields.PhoneNumbers
                ]
            });

            const localContacts = data
                .filter(contact => contact.firstName && contact.phoneNumbers && contact.phoneNumbers?.length > 0)
                .map(contact => {
                    let mappedContact: CustomContact = {
                        firstName: contact.firstName ?? "",
                        lastName: contact.lastName ?? null,
                        phone: contact.phoneNumbers?.[0].number?.replaceAll(" ", "") ?? ""
                    };

                    const phoneObj = parsePhoneNumberFromString(mappedContact.phone);

                    if (phoneObj) {
                        mappedContact.phone = phoneObj.nationalNumber;
                    }

                    return mappedContact;
                });

            return localContacts;
        }
    }, []);

    const fetchServerContacts = useCallback(async () => {
        const serverContacts = await contactsAPI.getContacts();
        const mappedServerContacts: CustomContact[] = serverContacts.map(({ id, user, ...contact }) => contact);
        return mappedServerContacts;
    }, []);

    const compareContacts = useCallback((localContacts: CustomContact[], serverContacts: CustomContact[]) => {
        const newContacts = localContacts.filter(localContact => 
            !serverContacts.some(serverContact => serverContact.phone === localContact.phone)
        )

        const updatedContacts = localContacts.filter(localContact => {
            const serverContact = serverContacts.find(serverContact => serverContact.phone === localContact.phone);

            return serverContact && (
                localContact.firstName !== serverContact.firstName ||
                localContact.lastName !== serverContact.lastName
            );
        });

        const deletedContacts = serverContacts.filter(serverContact => 
            !localContacts.some(localContact => localContact.phone === serverContact.phone)
        ).map(contact => contact.phone);

        return { newContacts, updatedContacts, deletedContacts };
    }, []);

    const synchContacts = async () => {
        try {
            const localContacts = await getLocalContacts();

            if(localContacts) {
                const serverContacts = await fetchServerContacts();
                const { newContacts, updatedContacts, deletedContacts } = compareContacts(localContacts, serverContacts);

                await contactsAPI.syncContacts(newContacts, updatedContacts, deletedContacts);

                contactsContext?.fetchContacts();
            }
        } catch (error) {
            //  No need to do anything
        }
    };

    const checkPreferences = async () => {
        try {
            if(appContext?.isAccessibilityEnabled === null) {
                //  If accessibility preference is not set yet, initialize it with a default value.
                await appContext?.updateAccessibility(true);
            }

            if(notificationsContext?.isNotificationsEnabled !== false) {
                //  If notifications preference is true, we initialize notifications
                //  Otherwise if is not set yet, we ask user if he wanto to use push notifications
                await notificationsContext?.initializeNotifications();
            }
        } catch (error) {
            //  No need to do anything: unable to update preferences
        }
    };

    useEffect(() => {
        const initializeApp = async () => {
            await synchContacts();
            await checkPreferences();
            await checkInitialNotification();
        };
        
        initializeApp();
    }, []);

    useEffect(() => {
        authContext?.fetchProfile();
    }, []);

    useEffect(() => {
        connectSocket();

        return () => { disconnectSocket(); };
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerTitleAlign: "center",
                headerTitleStyle: { 
                    fontFamily: "inter_bold",
                    fontSize: 25,
                    color: theme.primaryText 
                },
                headerShadowVisible: false,
                headerStyle: { backgroundColor: theme.surface },
                tabBarStyle: {
                    borderTopWidth: undefined, 
                    backgroundColor: theme.secondary,
                    elevation: 10
                },
                tabBarLabelStyle: { fontFamily: "inter_regular" },
                tabBarActiveTintColor: theme.accent,
                tabBarInactiveTintColor: theme.secondaryText,
                tabBarHideOnKeyboard: true
            }}>
            <Tabs.Screen
                name="calls"
                options={{
                    title: 'Calls',
                    tabBarIcon: ({ focused, color }) => {
                        return(
                            focused ? <CallIconBold fill={color} /> :
                                <CallIcon stroke={color} />
                        );
                    } 
                }}
            />
            <Tabs.Screen 
                name="contacts" 
                options={{
                    title: 'Contacts',
                    tabBarIcon: ({ focused, color }) => {
                        return(
                            focused ? <ContactIconBold fill={color} /> :
                                <ContactIcon stroke={color} />
                        );
                    } 
                }} 
            />
            <Tabs.Screen
                name="transcriptions"
                options={{
                    title: 'Transcriptions',
                    tabBarIcon: ({ focused, color }) => {
                        return(
                            focused ? <TranscriptionIconBold fill={color} /> :
                                <TranscriptionIcon stroke={color} />
                        );
                    }
                }}
            />
            <Tabs.Screen 
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => {
                        return(
                            <ImageProfile 
                                uri={authContext?.user?.imageProfile ?? null}
                                size={24}
                                style={{
                                    borderWidth: 1.75,
                                    borderRadius: 12, 
                                    borderColor: color
                                }}
                            />
                        );
                    }
                }}
            />
        </Tabs>
    );
}