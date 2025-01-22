import { ContactsContext } from '@/contexts/ContactsContext';
import { useTheme } from '@/hooks/useTheme';
import { Contact } from '@/types/Contact';
import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function InfoContact() {
    const theme = useTheme();
    const contactsContext = useContext(ContactsContext);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [contact, setContact] = useState<Contact | null>(null);

    useEffect(() => {
        const fetchContactData = async () => {
            const contactData = await contactsContext?.fetchContact(id);

            if(contactData) {
                setContact(contactData);
            }
        };

        fetchContactData();
    }, []);

    return (
        <View style={[styles.main, { backgroundColor: theme.surface }]} >
            <Text>{`Info Contact: ${id}`}</Text>
            <Text>{contact?.lastName ? contact.firstName + " " + contact.lastName : contact?.firstName}</Text>
            <Button title='Edit' onPress={() => router.push({ pathname: "/contacts/[id]/edit", params: { id }})}/>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center"
    },
});