import { useTheme } from '@/hooks/useTheme';
import { Contact } from '@/types/Contact';
import { FlatList, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import ThemedText from './ThemedText';
import ListItem from './ListItem';
import Divider from './Divider';
import React, { useCallback, useContext, useMemo } from 'react';
import ImageProfile from './ImageProfile';
import { useRouter } from 'expo-router';
import { VideoCallContextType } from '@/contexts/VideoCallContext';
import * as Contacts from 'expo-contacts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as Linking from 'expo-linking';
import { ErrorContext } from '@/contexts/ErrorContext';

interface ContactsCardProps {
    label?: string;
    contacts: Contact[];
    style?: StyleProp<ViewStyle>;
    type?: 'view' | 'call';
    action?: () => void;
    videoCallContext: VideoCallContextType | undefined;
}

export default function ContactsCard({ label, contacts, style, type='view', action, videoCallContext }: ContactsCardProps) {
    const theme = useTheme();
    const router = useRouter();
    const errorContext = useContext(ErrorContext);
    const message = useMemo(() => "Let's talk on SignChat! It's a secure and fast app to make calls with great accessibility features. " +
        "Download it: http://192.168.178.183:3000/api/downloads/app", []);

    const searchContactLocally = useCallback(async (phone: string) => {
        //  Request Permissions
        await Contacts.requestPermissionsAsync();

        //  Search local contact
        const { data } = await Contacts.getContactsAsync();

        const contact = data.find(localContact => {
            const contactPhone = localContact.phoneNumbers?.[0].number?.replaceAll(" ", "") ?? "";
            const phoneObj = parsePhoneNumberFromString(contactPhone);

            if (phoneObj) {
                return phone === phoneObj.nationalNumber;
            }

            return phone === contactPhone;
        });

        return contact;
    }, []);

    if(contacts.length === 0) {
        return null;
    }

    return (
        <View style={[styles.main, style]}>
            <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.label}>
                {label ?? "Invite on SignChat"}
            </ThemedText>
            <FlatList 
                data={contacts}
                keyExtractor={contact => contact.id.toString()}
                renderItem={({ item: contact }) => (
                    <ListItem
                        leadingContent={
                            <ImageProfile
                                uri={contact.user?.imageProfile ?? null}
                                size={35}
                                style={styles.image}
                            />
                        }
                        headlineContent={
                            <ThemedText color={theme.primaryText} fontSize={16} fontWeight="semibold" numberOfLines={1} >
                                {contact.lastName ? contact.firstName + " " + contact.lastName : contact.firstName}
                            </ThemedText>
                        }
                        trailingContent={!label ?
                            <ThemedText
                                color={theme.accent}
                                fontSize={13}
                                fontWeight="regular"
                            >
                                Invite
                            </ThemedText> : undefined
                        }
                        onPress={async () => {
                            try {
                                if (action) { action(); }

                                if (label) {
                                    if (type === 'view') {
                                        router.push({
                                            pathname: "/contacts/[id]/info",
                                            params: { id: contact.id }
                                        });
                                    } else if (contact.user) {
                                        videoCallContext?.startCall(contact.user.id, contact.phone, contact.id);
                                    }
                                } else {
                                    const localContact = await searchContactLocally(contact.phone);
                                    const phoneNumber = localContact?.phoneNumbers?.[0].number;

                                    if (phoneNumber) {
                                        const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
                                        await Linking.openURL(smsUrl);
                                    }
                                }
                            } catch (error) {
                                errorContext?.handleError(error);
                            }
                        }}
                        style={styles.row}
                    />
                )}
                ItemSeparatorComponent={() => (
                    <Divider height={0.5} width="83%" style={styles.divider} />
                )}
                style={[styles.surface, { backgroundColor: theme.onSurface }]}
                contentContainerStyle={styles.surfaceContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        width: "100%"
    },
    label: {
        marginHorizontal: 8,
        marginBottom: 5,
        alignSelf: "flex-start"
    },
    surface: {
        borderRadius: 15
    },
    surfaceContent: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start"
    },
    row: {
        marginVertical: 8,
        paddingHorizontal: "3.5%"
    },
    image: {
        marginRight: 15
    },
    divider: {
        alignSelf: "flex-end"
    }
});