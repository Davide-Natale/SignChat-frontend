import ThemedButton from '@/components/ThemedButton';
import ThemedText from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useContext, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView,TextInput, ActivityIndicator } from 'react-native';
import EmailIcon from "@/assets/icons/email-bold.svg";
import LockIcon from "@/assets/icons/lock-bold.svg";
import { AppContext } from '@/contexts/AppContext';
import { ErrorContext } from '@/contexts/ErrorContext';
import ThemedSnackBar from '@/components/ThemedSnackBar';

export default function Login() {
    const theme = useTheme();
    const router = useRouter();
    const appContext = useContext(AppContext);
    const errorContext = useContext(ErrorContext);
    const authContext = useContext(AuthContext);
    const [email, setEmail] = useState("daxnatale@gmail.com");
    const [password, setPassword] = useState("Password1!");
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const [passwordErrMsg, setPasswordErrMsg] = useState("");
    const textInputRef = useRef<TextInput>(null);

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
        if(password === "") {
            setPasswordErrMsg("Password is a required field.");
            return false;
        } 
            
        setPasswordErrMsg("");
        return true; 
    };

    const handleSubmit = async () => {
        const emailIsValid = checkEmail();
        const passwordIsValid = checkPassword();

        if(emailIsValid && passwordIsValid) {
            try {
                errorContext?.clearErrMsg();
                appContext?.updateLoading(true);
                await authContext?.login(email, password);
                if (router.canDismiss()) { router.dismissAll(); }
                router.replace("/calls");
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
                    {"Hey,\nWelcome Back!"}
                </ThemedText>
                <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.description}>
                    Please login to continue.
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
                    onSubmitEditing={() => textInputRef.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef}
                    value={password}
                    onChangeText={p => setPassword(p)}
                    errMsg={passwordErrMsg}
                    secureTextEntry
                    placeholder='Password'
                    leadingIcon={<LockIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='default'
                    returnKeyType='done'
                    onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity
                    onPress={() => { router.push("/forgot-password"); }}
                    touchSoundDisabled
                    activeOpacity={0.8}
                    style={styles.textButton}
                    disabled={appContext?.loading}
                >
                    <ThemedText color={theme.primaryText} fontSize={15} fontWeight="semibold" >
                        Forgot Password?
                    </ThemedText>
                </TouchableOpacity>
                <ThemedButton
                    onPress={handleSubmit}
                    height={60}
                    width="100%"
                    backgroundColor={theme.accent}
                    disabled={appContext?.loading}
                    style={styles.button}
                >
                    { appContext?.loading ? <ActivityIndicator color={theme.onAccent} size="large" /> :
                        <ThemedText color={theme.onAccent} fontSize={20} fontWeight="bold" >Login</ThemedText>
                    }
                </ThemedButton>
                <View style={styles.textGroup}>
                    <ThemedText color={theme.secondaryText} fontSize={14} fontWeight='medium'>
                        Don't have an account?
                    </ThemedText>
                    <TouchableOpacity 
                        onPress={() => { router.replace("/register"); }} 
                        touchSoundDisabled
                        activeOpacity={0.8}
                        disabled={appContext?.loading}
                    >
                        <ThemedText color={theme.accent} fontSize={14} fontWeight='bold' style={styles.text}>Sign Up</ThemedText>
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
    textButton: {
        alignSelf: "flex-end",
        marginHorizontal: 3
    },
    button: {
        marginTop: 70,
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