import authAPI from '@/api/authAPI';
import OtpForm from '@/components/OtpForm';
import ThemedText from '@/components/ThemedText';
import { AppContext } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { isAxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function VerifyOtp() {
    const theme = useTheme();
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const appContext = useContext(AppContext);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [errMsg, setErrMsg] = useState("");

    const maskEmail = (email: string) => {
        const [localPart, domain] = email.split('@');
        const maskedLocalPart = localPart.length > 3 ?
            `${localPart.slice(0, 3)}***`
            : `${localPart.slice(0, 1)}***`;

        return `${maskedLocalPart}@${domain}`;
    };

    const checkOtp = (otp: string) => {
        if (!/^[0-9]{6}$/.test(otp)) {
            setErrMsg("OTP must contain exactly 6 digits.");
            return false;
        }

        return true;
    }

    const handleSubmit = async () => {
        const literalOtp = otp.join("");
        const isOtpValid = checkOtp(literalOtp);

        if (isOtpValid) {
            try {
                appContext?.updateLoading(true);
                //const { accessToken } = await authAPI.verifyOtp(email, literalOtp);
                //  TODO: add store access token code
                router.push("/reset-password");
            } catch (error) {
                if (isAxiosError(error)) {
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
                    OTP Verification
                </ThemedText>
                <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.description}>
                    {`Plese enter the 6-digit code sent to your email address: ${maskEmail(email)}`}
                </ThemedText>
                <OtpForm otp={otp} setOtp={setOtp} errMsg={errMsg} handleSubmit={handleSubmit} />
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