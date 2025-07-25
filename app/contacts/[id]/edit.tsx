import ThemedTextButton from '@/components/ThemedTextButton';
import ThemedTextInput from '@/components/ThemedTextInput';
import { AppContext } from '@/contexts/AppContext';
import { ContactsContext } from '@/contexts/ContactsContext';
import { ErrorContext } from '@/contexts/ErrorContext';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import UserIcon from "@/assets/icons/user-bold.svg";
import PhoneIcon from "@/assets/icons/call-bold.svg";
import ThemedSnackBar from '@/components/ThemedSnackBar';
import * as Contacts from 'expo-contacts';
import contactsAPI from '@/api/contactsAPI';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function EditContact() {
    const theme = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const appContext = useContext(AppContext);
    const errorContext = useContext(ErrorContext);
    const contactsContext = useContext(ContactsContext);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [oldPhone, setOldPhone] = useState("");
    const [firstErrMsg, setFirstErrMsg] = useState("");
    const [phoneErrMsg, setPhoneErrMsg] = useState("");
    const textInputRef1 = useRef<TextInput>(null);
    const textInputRef2 = useRef<TextInput>(null);

    useEffect(() => {
        const fetchContactData = async () => {
            const contact = await contactsContext?.fetchContact(parseInt(id));

            if (contact) {
                setFirstName(contact.firstName);
                setLastName(contact.lastName ?? "");
                setPhone(contact.phone);
                setOldPhone(contact.phone);
            }
        };

        fetchContactData();
    }, []);

    const updateContactLocally = async (): Promise<void> => {
        //  Request Permissions
        await Contacts.requestPermissionsAsync();

        //  Search local contact id
        const { data } = await Contacts.getContactsAsync();

        const contactId = data.find(contact => {
            const contactPhone = contact.phoneNumbers?.[0].number?.replaceAll(" ", "") ?? "";
            const phoneObj = parsePhoneNumberFromString(contactPhone);

            if(phoneObj) {
                return oldPhone === phoneObj.nationalNumber;
            }

            return oldPhone === contactPhone;
        })?.id;
            
        if(contactId) {
            //  Update contact locally
            await Contacts.updateContactAsync({
                id: contactId,
                [Contacts.Fields.ContactType]: Contacts.ContactTypes.Person,
                [Contacts.Fields.Name]: lastName ? firstName + " " + lastName : firstName,
                [Contacts.Fields.FirstName]: firstName,
                [Contacts.Fields.LastName]: lastName,
                [Contacts.Fields.PhoneNumbers]: [{ number: phone, label: "mobile", isPrimary: true }]
            });
        }
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

                await updateContactLocally();

                await contactsAPI.updateContact({
                    id: parseInt(id),
                    firstName,
                    lastName: lastName ? lastName : null,
                    phone
                });

                router.back();
            } catch (error) {
                errorContext?.handleError(error);
            } finally {
                appContext?.updateLoading(false);
            }
        }
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <ThemedTextButton text='Save' onPress={handleSubmit} />
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