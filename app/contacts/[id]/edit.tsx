import { ContactsContext } from '@/contexts/ContactsContext';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function EditContact() {
    const theme = useTheme();
    const contactsContext = useContext(ContactsContext);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [firstErrMsg, setFirstErrMsg] = useState("");
    const [lastErrMsg, setLastErrMsg] = useState("");
    const [phoneErrMsg, setPhoneErrMsg] = useState("");
    const textInputRef1 = useRef<TextInput>(null);
    const textInputRef2 = useRef<TextInput>(null);

    useEffect(() => {
        const fetchContactData = async () => {
            const contact = await contactsContext?.fetchContact(id);

            if (contact) {
                setFirstName(contact.firstName);
                setLastName(contact.lastName ?? "");
                setPhone(contact.phone);
            }
        };

        fetchContactData();
    }, []);

    return (
        <View style={[styles.main, { backgroundColor: theme.primary }]} >
            <Text>{`Edit Contact: ${id}`}</Text>
            <Text>{firstName}</Text>
            <Text>{phone}</Text>
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