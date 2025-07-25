import { useTheme } from '@/hooks/useTheme';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';
import { Contact } from '@/types/Contact';
import { forwardRef, useCallback, useContext, useMemo, useState } from 'react';
import SearchBar from './SearchBar';
import ContactsCard from './ContactsCard';
import { FlatList } from 'react-native-gesture-handler';
import { VideoCallContext } from '@/contexts/VideoCallContext';

interface CallsBottomSheetProps {
    groupedContacts: Record<string, Contact[]>;
    unregisteredContacts: Contact[];
}

type Ref = BottomSheetModal;

const CallsBottomSheet = forwardRef<Ref, CallsBottomSheetProps>(({ groupedContacts, unregisteredContacts }, ref) => {
    const theme = useTheme();
    const videoCallContext = useContext(VideoCallContext);
    const [searchFilter, setSearchFilter] = useState("");
    const snapPoints = useMemo(() => ['95%'], []);

    const applyNameFilter = useCallback((firstName: string, lastName: string | null, phone: string, filter: string) => {
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
                applyNameFilter(contact.firstName, contact.lastName, contact.phone, searchFilter)
            )
        )
    ), [groupedContacts, searchFilter]);

    const filteredUnregisteredContacts = useMemo(() => 
        unregisteredContacts.filter(contact => (
            applyNameFilter(contact.firstName, contact.lastName, contact.phone, searchFilter)
        )
    ), [unregisteredContacts, searchFilter]);

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
            backgroundStyle={{ backgroundColor: theme.surface }}
            handleIndicatorStyle={{ backgroundColor: theme.primaryText }}
            onChange={index => {
                if (index === -1) {
                    setSearchFilter("");
                }
            }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <ThemedText color={theme.primaryText} fontSize={20} fontWeight="medium" style={styles.title}>
                    New call
                </ThemedText>
                <SearchBar
                    value={searchFilter}
                    onChangeText={f => setSearchFilter(f)}
                    clearValue={() => setSearchFilter("")}
                    style={styles.searchBar}
                />
                {searchFilter !== "" ?
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
                                    type={label ? 'call' : undefined }
                                    action={label ? () => {
                                        if (ref && "current" in ref && ref.current) {
                                            ref.current.dismiss();
                                        } 
                                    } : undefined}
                                    videoCallContext={videoCallContext}
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
                            <ContactsCard
                                label={letter}
                                contacts={contacts}
                                style={styles.card}
                                type='call'
                                action={() => {
                                    if (ref && "current" in ref && ref.current) {
                                        ref.current.dismiss();
                                    }
                                }}
                                videoCallContext={videoCallContext}
                            />
                        )}
                        ListFooterComponent={() => <ContactsCard contacts={unregisteredContacts} videoCallContext={videoCallContext} style={styles.footer} />}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        style={styles.list}
                    />
                }
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default CallsBottomSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: 'center'
    },
    title: {
        marginTop: 5,
        marginBottom: 20
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
        marginBottom: 35
    }
});