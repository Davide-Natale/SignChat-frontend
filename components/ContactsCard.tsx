import { useTheme } from '@/hooks/useTheme';
import { Contact } from '@/types/Contact';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import ThemedText from './ThemedText';
import ListItem from './ListItem';
import Divider from './Divider';
import React from 'react';

interface ContactsCardProps {
    label?: string;
    contacts: Contact[];
    style?: StyleProp<ViewStyle>
}

//  TODO: implement

export default function ContactsCard({ label, contacts, style }: ContactsCardProps) {
    const theme = useTheme();

    return (
        <View style={[styles.main, style]}>
            <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.label}>
                {label}
            </ThemedText>
            <View style={[styles.surface, { backgroundColor: theme.onSurface }]} >
                {   contacts.map((contact, index) => (
                        <React.Fragment key={contact.id}>
                            <ListItem
                                leadingContent={undefined}
                                headlineContent={
                                    <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                                        {contact.firstName + " " + contact.lastName}
                                    </ThemedText>
                                }
                                style={styles.row}
                            />
                            { index < contacts.length ? <Divider height={0.5} width="85%" style={styles.divider} /> : null }
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
        borderRadius: 20
      },
      row: {
        marginVertical: 15,
        paddingHorizontal: "5%"
      },
      icon: {
        marginRight: 15
      },
      divider: {
        alignSelf: "flex-end" 
      }
});