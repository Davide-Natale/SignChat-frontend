import { useTheme } from '@/hooks/useTheme';
import { Contact } from '@/types/Contact';
import { FlatList, StyleProp, StyleSheet, ToastAndroid, View, ViewStyle } from 'react-native';
import ThemedText from './ThemedText';
import ListItem from './ListItem';
import Divider from './Divider';
import React from 'react';
import ImageProfile from './ImageProfile';
import { useRouter } from 'expo-router';

interface ContactsCardProps {
    label?: string;
    contacts: Contact[];
    style?: StyleProp<ViewStyle>;
    type?: 'view' | 'call';
    action?: () => void;
}

export default function ContactsCard({ label, contacts, style, type='view', action }: ContactsCardProps) {
    const theme = useTheme();
    const router = useRouter();

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
                        onPress={() => {
                            if (action) { action(); }

                            if (label) {
                                if (type === 'view') {
                                    router.push({
                                        pathname: "/contacts/[id]/info",
                                        params: { id: contact.id }
                                    });
                                } else {
                                    //  TODO: add code to call user
                                }
                            } else {
                                ToastAndroid.show('Coming Soon!', ToastAndroid.SHORT);
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