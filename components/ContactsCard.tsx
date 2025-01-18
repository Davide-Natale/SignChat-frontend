import { useTheme } from '@/hooks/useTheme';
import { Contact } from '@/types/Contact';
import { StyleProp, StyleSheet, ToastAndroid, View, ViewStyle } from 'react-native';
import ThemedText from './ThemedText';
import ListItem from './ListItem';
import Divider from './Divider';
import React from 'react';
import ImageProfile from './ImageProfile';

interface ContactsCardProps {
    label?: string;
    contacts: Contact[];
    style?: StyleProp<ViewStyle>
}

export default function ContactsCard({ label, contacts, style }: ContactsCardProps) {
    const theme = useTheme();

    return (
        <View style={[styles.main, style]}>
            <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.label}>
                {label ?? "Invite on SignChat"}
            </ThemedText>
            <View style={[styles.surface, { backgroundColor: theme.onSurface }]} >
                {   contacts.map((contact, index) => (
                        <React.Fragment key={contact.id}>
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
                                trailingContent={ !label ? 
                                    <ThemedText 
                                        color={theme.accent} 
                                        fontSize={13} 
                                        fontWeight="regular"
                                    >
                                        Invite
                                    </ThemedText> : undefined
                                }
                                onPress={() => {
                                    if(label) {
                                        /**TODO: add navigation to contact info route */
                                    } else {
                                        ToastAndroid.show('Coming Soon!', ToastAndroid.SHORT);
                                    }
                                }}
                                style={styles.row}
                            />
                            { index < contacts.length - 1 ? <Divider height={0.5} width="83%" style={styles.divider} /> : null }
                        </React.Fragment>
                    ))
                }
            </View>
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
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderRadius: 15
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