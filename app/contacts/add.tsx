import ThemedTextButton from '@/components/ThemedTextButton';
import ThemedTextInput from '@/components/ThemedTextInput';
import { AppContext } from '@/contexts/AppContext';
import { ErrorContext } from '@/contexts/ErrorContext';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import UserIcon from "@/assets/icons/user-bold.svg";
import PhoneIcon from "@/assets/icons/call-bold.svg";
import ThemedSnackBar from '@/components/ThemedSnackBar';
import * as Contacts from 'expo-contacts';
import contactsAPI from '@/api/contactsAPI';

export default function AddContact() {
    const theme = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const appContext = useContext(AppContext);
    const errorContext = useContext(ErrorContext);
    const { userPhone } = useLocalSearchParams<{ userPhone: string }>();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState(userPhone ?? "");
    const [firstErrMsg, setFirstErrMsg] = useState("");
    const [phoneErrMsg, setPhoneErrMsg] = useState("");
    const textInputRef1 = useRef<TextInput>(null);
    const textInputRef2 = useRef<TextInput>(null);

    const createContactLocally = async () => {
        //  Request Permissions
        await Contacts.requestPermissionsAsync();

        //  Create contact locally
        await Contacts.addContactAsync({
            [Contacts.Fields.ContactType]: Contacts.ContactTypes.Person,
            [Contacts.Fields.Name]: lastName ? firstName + " " + lastName : firstName,
            [Contacts.Fields.FirstName]: firstName,
            [Contacts.Fields.LastName]: lastName,
            [Contacts.Fields.PhoneNumbers]: [{ number: phone, label: "mobile", isPrimary: true }]
        });
    }

    const checkFirstName = () => { 
        if(firstName === "") {
            setFirstErrMsg("First Name is a required field.");
            return false;
        } 
            
        setFirstErrMsg("");
        return true;
    }

    const checkPhoneNumber = () => {
        const phoneRegex = /^[0-9]+$/;

        if(phone === "") {
            setPhoneErrMsg("Phone Number is a required field.");
            return false;
        }

        if(!phoneRegex.test(phone)) {
            setPhoneErrMsg("Insert a valid phone number.");
            return false;
        }

        setPhoneErrMsg("");
        return true;
    }

    const handleSubmit = async () => {
        const isFirstValid = checkFirstName();
        const isPhoneValid = checkPhoneNumber();

        if (isFirstValid && isPhoneValid) {
            try {
                errorContext?.clearErrMsg();
                appContext?.updateLoading(true);

                await createContactLocally();

                const contactId = await contactsAPI.createContact({
                    firstName,
                    lastName: lastName ? lastName : null,
                    phone
                });

                if(userPhone) {
                    router.back();
                }

                router.replace({
                    pathname: "/contacts/[id]/info",
                    params: { id: contactId }
                });
            } catch (error) {
                errorContext?.handleError(error);
            } finally {
                appContext?.updateLoading(false);
            }
        }
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <ThemedTextButton text='Create' onPress={handleSubmit} />
        });
    }, [firstName, lastName, phone]);

    return (
        <ScrollView
            contentContainerStyle={[styles.main, { backgroundColor: theme.primary }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.inner}>
                <ThemedTextInput
                    value={firstName}
                    onChangeText={f => setFirstName(f)}
                    clearValue={() => setFirstName("")}
                    errMsg={firstErrMsg}
                    placeholder='First Name'
                    leadingIcon={<UserIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='words'
                    keyboardType='default'
                    returnKeyType='next'
                    onSubmitEditing={() => textInputRef1.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef1}
                    value={lastName}
                    onChangeText={l => setLastName(l)}
                    clearValue={() => setLastName("")}
                    errMsg=""
                    placeholder='Last Name'
                    leadingIcon={<UserIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='words'
                    keyboardType='default'
                    returnKeyType='next'
                    onSubmitEditing={() => textInputRef2.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef2}
                    value={phone}
                    onChangeText={p => setPhone(p)}
                    clearValue={() => setPhone("")}
                    errMsg={phoneErrMsg}
                    placeholder='Phone Number'
                    leadingIcon={<PhoneIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='number-pad'
                    returnKeyType='done'
                    onSubmitEditing={handleSubmit}
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
    }
});