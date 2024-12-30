import authAPI from '@/api/authAPI';
import ThemedText from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import { AppContext } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useContext, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import LockIcon from "@/assets/icons/lock-bold.svg";
import ThemedButton from '@/components/ThemedButton';
import { deleteToken } from '@/utils/secureStore';

export default function ResetPassword() {
    const theme = useTheme();
    const router = useRouter();
    const appContext = useContext(AppContext);
    const [password, setPassword] = useState("Bb1!pppp");
    const [confirmPassword, setConfirmPassword] = useState("Bb1!pppp");
    const [passwordErrMsg, setPasswordErrMsg] = useState("");
    const [confirmPasswordErrMsg, setConfirmPasswordErrMsg] = useState("");
    const textInputRef = useRef<TextInput>(null);
    const description = "Your new password must contain at least 8 characters " +
        "and include a combination of numbers, letters and special characters (@$!%*?&#).";

    const checkPassword = () => {
        if (password.length < 8) {
            setPasswordErrMsg("Password must be at least 8 characters long.");
            return false;
        }

        if (!/[A-Z]/.test(password)) {
            setPasswordErrMsg("Password must include at least one uppercase letter.");
            return false;
        }

        if (!/[a-z]/.test(password)) {
            setPasswordErrMsg("Password must include at least one lowercase letter.");
            return false;
        }

        if (!/[0-9]/.test(password)) {
            setPasswordErrMsg("Password must include at least one number.");
            return false;
        }

        if (!/[@$!%*?&#]/.test(password)) {
            setPasswordErrMsg("Password must include at least one special character (@$!%*?&#).");
            return false;
        }

        setPasswordErrMsg("");
        return true;
    };

    const checkConfirmPassword = () => {
        if (confirmPassword === "") {
            setConfirmPasswordErrMsg("Confirm Password is a required field.");
            return false;
        }

        if (confirmPassword !== password) {
            setConfirmPasswordErrMsg("Passwords do not match.");
            return false;
        }

        setConfirmPasswordErrMsg("");
        return true;
    }

    const handleSubmit = async () => {
        const passwordIsValid = checkPassword();
        const confirmPasswordIsValid = checkConfirmPassword();

        if (passwordIsValid && confirmPasswordIsValid) {
            try {
                appContext?.updateLoading(true);
                await authAPI.resetPassword(password);

                // Delete accessToken from Secure Store
                await deleteToken('accessToken');

                if (router.canDismiss()) { router.dismissAll(); }
                router.replace("/password-changed");
            } catch (error) {
                if (isAxiosError(error)) {
                    //  Handle error
                    console.log(error.response?.data.message);
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
                    Reset Password
                </ThemedText>
                <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.description}>
                    {description}
                </ThemedText>
                <ThemedTextInput
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
                    onSubmitEditing={() => textInputRef.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef}
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
                        <ThemedText color={theme.onAccent} fontSize={20} fontWeight="bold" >Confirm</ThemedText>
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
        marginTop: 40,
        marginBottom: 30
    }
});