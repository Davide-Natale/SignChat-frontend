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

export default function ChangePassword() {
    const theme = useTheme();
    const router = useRouter();
    const appContext = useContext(AppContext);
    const [currentPassword, setCurrentPassword] = useState("Bb1!pppp");
    const [newPassword, setNewPassword] = useState("Bb1!aaaa");
    const [confirmNewPassword, setConfirmNewPassword] = useState("Bb1!aaaa");
    const [currrentPasswordErrMsg, setCurrrentPasswordErrMsg] = useState("");
    const [newPasswordErrMsg, setNewPasswordErrMsg] = useState("");
    const [confirmNewPasswordErrMsg, setConfirmNewPasswordErrMsg] = useState("");
    const textInputRef1 = useRef<TextInput>(null);
    const textInputRef2 = useRef<TextInput>(null);
    const description = "Your new password must contain at least 8 characters " +
        "and include a combination of numbers, letters and special characters (@$!%*?&#).";
    const checkCurrentPassword= () => {
        if(currentPassword === "") {
            setCurrrentPasswordErrMsg("Current Password is a required field.");
            return false;
        } 
            
        setCurrrentPasswordErrMsg("");
        return true;
    };

    const checkNewPassword = () => {
        if (newPassword.length < 8) {
            setNewPasswordErrMsg("New Password must be at least 8 characters long.");
            return false;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setNewPasswordErrMsg("New Password must include at least one uppercase letter.");
            return false;
        }

        if (!/[a-z]/.test(newPassword)) {
            setNewPasswordErrMsg("New Password must include at least one lowercase letter.");
            return false;
        }

        if (!/[0-9]/.test(newPassword)) {
            setNewPasswordErrMsg("New Password must include at least one number.");
            return false;
        }

        if (!/[@$!%*?&#]/.test(newPassword)) {
            setNewPasswordErrMsg("New Password must include at least one special character (@$!%*?&#).");
            return false;
        }

        setNewPasswordErrMsg("");
        return true;
    };

    const checkConfirmNewPassword = () => {
        if (confirmNewPassword === "") {
            setConfirmNewPasswordErrMsg("Confirm New Password is a required field.");
            return false;
        }

        if (confirmNewPassword !== newPassword) {
            setConfirmNewPasswordErrMsg("Passwords do not match.");
            return false;
        }

        setConfirmNewPasswordErrMsg("");
        return true;
    }

    const handleSubmit = async () => {
        const currentPasswordIsValid = checkCurrentPassword();
        const newPasswordIsValid = checkNewPassword();
        const confirmNewPasswordIsValid = checkConfirmNewPassword();

        if (currentPasswordIsValid && newPasswordIsValid && confirmNewPasswordIsValid) {
            try {
                appContext?.updateLoading(true);
                await authAPI.changePassword(currentPassword, newPassword);
                router.back();
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
                    Change Password
                </ThemedText>
                <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.description}>
                    {description}
                </ThemedText>
                <ThemedTextInput
                    value={currentPassword}
                    onChangeText={p => setCurrentPassword(p)}
                    errMsg={currrentPasswordErrMsg}
                    secureTextEntry
                    placeholder='Current Password'
                    leadingIcon={<LockIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='default'
                    returnKeyType='next'
                    onSubmitEditing={() => textInputRef1.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef1}
                    value={newPassword}
                    onChangeText={p => setNewPassword(p)}
                    errMsg={newPasswordErrMsg}
                    secureTextEntry
                    placeholder='New Password'
                    leadingIcon={<LockIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='default'
                    returnKeyType='next'
                    onSubmitEditing={() => textInputRef2.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef2}
                    value={confirmNewPassword}
                    onChangeText={p => setConfirmNewPassword(p)}
                    errMsg={confirmNewPasswordErrMsg}
                    secureTextEntry
                    placeholder='Confirm New Password'
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