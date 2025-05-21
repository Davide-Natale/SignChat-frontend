import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useContext, useState, useRef } from 'react';
import ThemedButton from '@/components/ThemedButton';
import ThemedText from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import {  StyleSheet, TouchableOpacity, View, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import EmailIcon from "@/assets/icons/email-bold.svg";
import LockIcon from "@/assets/icons/lock-bold.svg";
import { AppContext } from '@/contexts/AppContext';
import { ErrorContext } from '@/contexts/ErrorContext';
import ThemedSnackBar from '@/components/ThemedSnackBar';

export default function Login() {
    const theme = useTheme();
    const router = useRouter();
    const appContext = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const errorContext = useContext(ErrorContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const [passwordErrMsg, setPasswordErrMsg] = useState("");
    const [confirmPasswordErrMsg, setConfirmPasswordErrMsg] = useState("");
    const textInputRef1 = useRef<TextInput>(null);
    const textInputRef2 = useRef<TextInput>(null);

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

    const checkPassword = () => { 
        if(password.length < 8) {
            setPasswordErrMsg("Password must be at least 8 characters long.");
            return false;
        }
    
        if(!/[A-Z]/.test(password)) {
            setPasswordErrMsg("Password must include at least one uppercase letter.");
            return false;
        }
    
        if(!/[a-z]/.test(password)) {
            setPasswordErrMsg("Password must include at least one lowercase letter.");
            return false;
        }
    
        if(!/[0-9]/.test(password)) {
            setPasswordErrMsg("Password must include at least one number.");
            return false;
        }
    
        if(!/[@$!%*?&#]/.test(password)) {
            setPasswordErrMsg("Password must include at least one special character (@$!%*?&#).");
            return false;
        }
    
        setPasswordErrMsg("");
        return true; 
    };

    const checkConfirmPassword = () => { 
        if(confirmPassword === "") {
            setConfirmPasswordErrMsg("Confirm password is a required field.");
            return false;
        } 

        if(confirmPassword !== password) {
            setConfirmPasswordErrMsg("Passwords do not match.");
            return false;
        }

        setConfirmPasswordErrMsg("");
        return true;
    }

    const handleSubmit = async () => {
        const emailIsValid = checkEmail();
        const passwordIsValid = checkPassword();
        const confirmPasswordIsValid = checkConfirmPassword();

        if(emailIsValid && passwordIsValid && confirmPasswordIsValid) {
            try {
                errorContext?.clearErrMsg();
                appContext?.updateLoading(true);
                await authContext?.register(email, password);
                if (router.canDismiss()) { router.dismissAll(); }
                router.replace("/complete-profile");
            } catch (error) {
                errorContext?.handleError(error);
            } finally {
                appContext?.updateLoading(false);
            }          
        }
    }

    return (
        <ScrollView 
            contentContainerStyle={[styles.main, { backgroundColor: theme.primary }]} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.inner}>
                <ThemedText color={theme.primaryText} fontSize={32} fontWeight="bold" style={styles.title}>
                    {"Let's\nGet Started"}
                </ThemedText>
                <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.description}>
                    Please fill details to create an account.
                </ThemedText>
                <ThemedTextInput
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
                    onSubmitEditing={() => textInputRef1.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef1}
                    value={password}
                    onChangeText={p => setPassword(p)}
                    errMsg={passwordErrMsg}
                    secureTextEntry
                    placeholder='Password'
                    leadingIcon={<LockIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='default'
                    returnKeyType='next'
                    onSubmitEditing={() => textInputRef2.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef2}
                    value={confirmPassword}
                    onChangeText={p => setConfirmPassword(p)}
                    errMsg={confirmPasswordErrMsg}
                    secureTextEntry
                    placeholder='Confirm Password'
                    leadingIcon={<LockIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='default'
                    returnKeyType='done'
                    onSubmitEditing={handleSubmit}
                />
                <ThemedButton
                    onPress={handleSubmit}
                    height={60}
                    width="100%"
                    backgroundColor={theme.accent}
                    disabled={appContext?.loading}
                    style={styles.button}
                >
                    { appContext?.loading ? <ActivityIndicator color={theme.onAccent} size="large" /> :
                        <ThemedText color={theme.onAccent} fontSize={20} fontWeight="bold" >Sign Up</ThemedText>
                    }
                </ThemedButton>
                <View style={styles.textGroup}>
                    <ThemedText color={theme.secondaryText} fontSize={14} fontWeight='medium' >
                        Already have an account?
                    </ThemedText>
                    <TouchableOpacity 
                        onPress={() => { router.replace("/login"); }} 
                        touchSoundDisabled
                        activeOpacity={0.8}
                        disabled={appContext?.loading}
                    >
                        <ThemedText color={theme.accent} fontSize={14} fontWeight='bold' style={styles.text}>Login</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
            <ThemedSnackBar />
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
    title: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 0.2,
        marginTop: 18
    },
    description: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 0.2,
        marginTop: 10,
        marginBottom: 13
    },
    button: {
        marginTop: 50,
        marginBottom: 15
    },
    textGroup: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    text: {
        marginLeft: 5
    }
});