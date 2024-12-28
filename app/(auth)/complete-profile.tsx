import ImageProfile from '@/components/ImageProfile';
import ThemedTextInput from '@/components/ThemedTextInput';
import { AppContext } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { useNavigation } from 'expo-router';
import { useRouter } from 'expo-router';
import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import UserIcon from "@/assets/icons/user-bold.svg";
import EmailIcon from "@/assets/icons/email-bold.svg";
import PhoneIcon from "@/assets/icons/call-bold.svg";
import ThemedSaveButton from '@/components/ThemedSaveButton';

export default function CompleteProfile() {
    const theme = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const appContext = useContext(AppContext);
    const [firstName, setFirstName] = useState("Davide");
    const [lastName, setLastName] = useState("Natale");
    const [email, setEmail] = useState("daxnatale@gmail.com");
    const [phoneNumber, setPhoneNumber] = useState("3457604304");
    const [firstErrMsg, setFirstErrMsg] = useState("");
    const [lastErrMsg, setLastErrMsg] = useState("");
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const [phoneErrMsg, setPhoneErrMsg] = useState("");
    const textInputRef1 = useRef<TextInput>(null);
    const textInputRef2 = useRef<TextInput>(null);
    const textInputRef3 = useRef<TextInput>(null);

    const checkFirstName = () => { /* TODO: implement it */ }

    const checkLastName =  () => { /* TODO: implement it */ }
    
    const checkEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@\.]{2,}$/;

        if(email === "") {
            setEmailErrMsg("Email is a required field.");
            return false;
        } 

        if(!emailRegex.test(email)) {
            setEmailErrMsg("Insert a valid email.");
            return false;
        }
            
        setEmailErrMsg("");
        return true; 
    };

    const checkPhoneNumber = () => { /* TODO: implement it */ }

    const handleSubmit = async () => { /* TODO: implement it */ }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <ThemedSaveButton onPress={handleSubmit}/>
        });
    }, []);

    return (
        <ScrollView 
            contentContainerStyle={[styles.main, { backgroundColor: theme.primary }]} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.inner}>
                <ImageProfile showEdit size={150} onEditPress={() => {}}/>
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
                    errMsg={lastErrMsg}
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
                    value={email}
                    onChangeText={e => setEmail(e)}
                    clearValue={() => setEmail("")}
                    errMsg={emailErrMsg}
                    placeholder='Email'
                    leadingIcon={<EmailIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='email-address'
                    returnKeyType="next"
                    onSubmitEditing={() => textInputRef3.current?.focus()}
                />

                <ThemedTextInput
                    externalRef={textInputRef3}
                    value={phoneNumber}
                    onChangeText={p => setPhoneNumber(p)}
                    clearValue={() => setPhoneNumber("")}
                    errMsg={phoneErrMsg}
                    placeholder='Phone Number'
                    leadingIcon={<PhoneIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='numeric'
                    returnKeyType='done'
                    onSubmitEditing={handleSubmit}
                />
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
        width: "90%",
        justifyContent: "flex-start",
        alignItems: "center"
    },
});