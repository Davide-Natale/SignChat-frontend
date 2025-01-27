import callsAPI from '@/api/callsAPI';
import ImageProfile from '@/components/ImageProfile';
import ThemedText from '@/components/ThemedText';
import { ContactsContext } from '@/contexts/ContactsContext';
import { useTheme } from '@/hooks/useTheme';
import { Call } from '@/types/Call';
import { Contact } from '@/types/Contact';
import { formatDate } from '@/utils/dateUtils';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import VideoCallBoldIcon from '@/assets/icons/videoCall-bold.svg';
import VideoCallIcon from '@/assets/icons/videoCall.svg';
import EditIcon from '@/assets/icons/edit.svg';
import TrashIcon from '@/assets/icons/trash.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';
import { formatCallDuration, getCallDescription } from '@/utils/callsUtils';
import ThemedButton from '@/components/ThemedButton';
import ListItem from '@/components/ListItem';
import AlertDialog from '@/components/AlertDialog';
import { AppContext } from '@/contexts/AppContext';
import { ErrorContext } from '@/contexts/ErrorContext';
import ThemedSnackBar from '@/components/ThemedSnackBar';
import Divider from '@/components/Divider';
import * as Contacts from 'expo-contacts';
import contactsAPI from '@/api/contactsAPI';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function InfoContact() {
    const theme = useTheme();
    const router = useRouter();
    const appContext = useContext(AppContext);
    const errorContext = useContext(ErrorContext);
    const contactsContext = useContext(ContactsContext);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [contact, setContact] = useState<Contact | null>(null);
    const [recentCalls, setRecentCalls] = useState<Call[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const fullName = contact?.lastName ? contact.firstName + " " + contact.lastName : contact?.firstName;

    useFocusEffect(
        useCallback(() => {
            const fetchContactData = async () => {
                const contactData = await contactsContext?.fetchContact(parseInt(id));

                if(contactData) {
                    setContact(contactData);
                }
            };

            fetchContactData();
        }, [])
    );

    useEffect(() => {
        const fetchRecentCalls = async () => {
            if(contact) {
                try {
                    errorContext?.clearErrMsg();
                    const recentCalls = await callsAPI.getCalls({
                        contactId: contact.id,
                        limit: 3
                    });

                    setRecentCalls(recentCalls);
                } catch (error) {
                    errorContext?.handleError(error);
                }
            }
        };

        fetchRecentCalls();
    }, [contact]);

    const deleteContactLocally = async (): Promise<void> => {
        //  Request Permissions
        await Contacts.requestPermissionsAsync();

        //  Search local contact id
        const { data } = await Contacts.getContactsAsync();

        const contactId = data.find(localContact => {
            const contactPhone = localContact.phoneNumbers?.[0].number?.replaceAll(" ", "") ?? "";
            const phoneObj = parsePhoneNumberFromString(contactPhone);

            if (phoneObj) {
                return contact?.phone === phoneObj.nationalNumber;
            }

            return contact?.phone === contactPhone;
        })?.id;

        if(contactId) {
            //  Delete contact locally
            await Contacts.removeContactAsync(contactId);
        }
    }

    return (
        <ScrollView
            contentContainerStyle={[styles.main, { backgroundColor: theme.surface }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.inner}>
                <ImageProfile
                    uri={contact?.user?.imageProfile ?? null}
                    size={140}
                    style={styles.image}
                />
                <ThemedText
                    color={theme.primaryText}
                    fontSize={28}
                    fontWeight="semibold"
                    numberOfLines={1}
                >
                    {fullName}
                </ThemedText>
                <ThemedText
                    color={theme.secondaryText}
                    fontSize={18}
                    fontWeight="regular"
                    numberOfLines={1}
                    style={{ marginBottom: !contact?.user ? 15 : undefined }}
                >
                    {contact?.phone}
                </ThemedText>
                { contact?.user ? 
                    <ThemedButton
                        onPress={() => { /* TODO: add code to call contact */ }}
                        height={50}
                        width="70%"
                        backgroundColor={theme.accent}
                        style={styles.button}
                    >
                        <View style={styles.buttonContent}>
                            <VideoCallIcon height={26} width={26} stroke={theme.onAccent} style={styles.buttonIcon} />
                            <ThemedText
                                color={theme.onAccent}
                                fontSize={16}
                                fontWeight="medium"
                            >
                                Video Call
                            </ThemedText>
                        </View>
                    </ThemedButton> : null
                }
                <ThemedText
                    color={theme.secondaryText}
                    fontSize={15}
                    fontWeight="medium"
                    style={styles.label}
                >
                    Recent Calls
                </ThemedText>
                <View style={[styles.surface1, 
                    { 
                        justifyContent: recentCalls.length > 0 ? "flex-start" : "center",
                        backgroundColor: theme.onSurface
                    }
                ]}>
                    { recentCalls.length > 0 ? 
                        recentCalls.map((call, index) => (
                            <View key={call.id} style={[styles.descriptionRow, 
                                {
                                    marginBottom: index < recentCalls.length - 1 ? 10 : undefined
                                }
                            ]}>
                                <ThemedText
                                    color={theme.secondaryText}
                                    fontSize={13}
                                    fontWeight="medium"
                                    numberOfLines={1}
                                    style={styles.date}
                                >
                                    {formatDate(call.date)}
                                </ThemedText>
                                <View style={styles.descriptionContainer} >
                                    <View style={styles.description} >
                                        <VideoCallBoldIcon height={20} width={20} fill={theme.secondaryText} style={styles.descriptionIcon} />
                                        <ThemedText
                                            color={theme.primaryText}
                                            fontSize={13}
                                            fontWeight="medium"
                                            numberOfLines={1}
                                        >
                                            {getCallDescription(call.type, call.status)}
                                        </ThemedText>
                                    </View>
                                    {call.duration > 0 ?
                                        <ThemedText
                                            color={theme.secondaryText}
                                            fontSize={13}
                                            fontWeight="medium"
                                            numberOfLines={1}
                                        >
                                            {formatCallDuration(call.duration)}
                                        </ThemedText> : null
                                    }
                                </View>
                            </View>
                        )) :
                        <ThemedText
                            color={theme.secondaryText}
                            fontSize={16}
                            fontWeight="medium"
                            numberOfLines={1}
                            style={styles.message}
                        >
                            No recent calls
                        </ThemedText>
                    }
                </View>
                <View style={[styles.surface2, { backgroundColor: theme.onSurface }]} >
                    <ListItem
                        onPress={() => {
                            if(contact) {
                                router.push({ pathname: "/contacts/[id]/edit", params: { id: contact?.id } });
                            }
                        }}
                        leadingContent={<EditIcon stroke={theme.secondaryText} style={styles.icon} />}
                        headlineContent={
                            <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                                Edit Contact
                            </ThemedText>
                        }
                        trailingContent={<ArrowRightIcon stroke={theme.secondaryText} />}
                        style={styles.row}
                    />
                    <Divider height={0.5} width="85%" style={styles.divider} />
                    <ListItem
                        onPress={() => setShowDialog(true)}
                        leadingContent={<TrashIcon stroke={theme.error} style={styles.icon} />}
                        headlineContent={
                            <ThemedText color={theme.error} fontSize={16} fontWeight="regular" numberOfLines={1} >
                                Delete Contact
                            </ThemedText>
                        }
                        style={styles.row}
                    />
                </View>
                <AlertDialog
                    showDialog={showDialog}
                    title='Delete Contact'
                    content='Are you sure to delete this contact?'
                    confirmText='Delete'
                    onConfirm={async () => {
                        try {
                            errorContext?.clearErrMsg();
                            appContext?.updateLoading(true);

                            await deleteContactLocally();
                            await contactsAPI.deleteContact(parseInt(id));
                            
                            router.back();
                        } catch (error) {
                            errorContext?.handleError(error);
                        } finally {
                            appContext?.updateLoading(false);
                            setShowDialog(false);
                        }
                    }}
                    onDismiss={() => setShowDialog(false)}
                />
                <ThemedSnackBar />
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
    },
    image: {
        marginTop: 15,
        marginBottom: 5
    },
    button: {
        marginTop: 15,
        marginBottom: 25,
    },
    buttonContent: {
        flexDirection: "row", 
        justifyContent: "center", 
        alignItems: "center"
    },
    buttonIcon: {
        marginRight: 10
    },
    label: {
        marginHorizontal: 8,
        marginBottom: 5,
        alignSelf: "flex-start"
    },
    surface1: {
        width: "100%",
        minHeight: 120,
        alignItems: "flex-start",
        borderRadius: 20,
        marginBottom: 30,
        paddingVertical: 15,
        paddingHorizontal: "5%"
    },
    descriptionRow: {
        flexDirection: "row", 
        justifyContent: "flex-start", 
        alignItems: "flex-start"
    },
    date: {
        flex: 1
    },
    descriptionContainer: {
        flex: 2
    },
    description: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    descriptionIcon: {
        marginRight: 8
    },
    message: {
        alignSelf: "center"
    },
    surface2: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderRadius: 20,
        marginBottom: 30
    },
    row: {
        marginVertical: 12,
        paddingHorizontal: "5%"
    },
    icon: {
        marginRight: 15
    },
    divider: {
        alignSelf: "flex-end"
    }
});