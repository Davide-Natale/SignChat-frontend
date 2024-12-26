import ThemedText from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import { AppContext } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import EmailIcon from "@/assets/icons/email-bold.svg";
import ThemedButton from '@/components/ThemedButton';
import authAPI from '@/api/authAPI';

export default function ForgotPassword() {
    const theme = useTheme();
    const router = useRouter();
    const appContext = useContext(AppContext);
    const [email, setEmail] = useState("daxnatale@gmail.com");
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const description = "Don't worry! It happens. Please enter the email address assosieted with your account."

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

    const handleSubmit = async () => {
            const emailIsValid = checkEmail();
    
            if(emailIsValid) {
                try {
                    appContext?.updateLoading(true);
                    //  await authAPI.requestOtp(email);
                    router.push({
                        pathname: "/verify-otp",
                        params: { email }
                    });
                } catch (error) {
                    if(isAxiosError(error)) {
                        //  Handle error
                        console.log(error.request.data.message);
                    }
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
                    Forgot Password?
                </ThemedText>
                <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.description}>
                    {description}
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
                    returnKeyType="done"
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
                        <ThemedText color={theme.onAccent} fontSize={20} fontWeight="bold" >Submit</ThemedText>
                    }
                </ThemedButton>
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
    title: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 1,
        marginTop: 18
    },
    description: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 1,
        marginTop: 10,
        marginBottom: 18
    },
    button: {
        marginTop: 18,
        marginBottom: 30
    }
});