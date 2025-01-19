import { useTheme } from '@/hooks/useTheme';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function AddContact() {
    const theme = useTheme();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [firstErrMsg, setFirstErrMsg] = useState("");
    const [lastErrMsg, setLastErrMsg] = useState("");
    const [phoneErrMsg, setPhoneErrMsg] = useState("");
    const textInputRef1 = useRef<TextInput>(null);
    const textInputRef2 = useRef<TextInput>(null);

    return (
        <View style={[styles.main, { backgroundColor: theme.primary }]} >
            <Text>Add new Contact</Text>
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