import authAPI from '@/api/authAPI';
import OtpForm from '@/components/OtpForm';
import ThemedButton from '@/components/ThemedButton';
import ThemedSnackBar from '@/components/ThemedSnackBar';
import ThemedText from '@/components/ThemedText';
import { AppContext } from '@/contexts/AppContext';
import { ErrorContext } from '@/contexts/ErrorContext';
import { useTheme } from '@/hooks/useTheme';
import { saveToken } from '@/utils/secureStore';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';

//  Use duration plugin
dayjs.extend(duration);

export default function VerifyOtp() {
    const theme = useTheme();
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const appContext = useContext(AppContext);
    const errorContext = useContext(ErrorContext);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [errMsg, setErrMsg] = useState("");
    const [localLoading, setLocalLoading] = useState(false);
    const [timer, setTimer] = useState(120);
    const formattedTimer = dayjs.duration(timer, 'seconds').format('m:ss');

    useEffect(() => {
        if(timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timer]);


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

        setErrMsg("");
        return true;
    };

    const handleSubmit = async () => {
        const literalOtp = otp.join("");
        const isOtpValid = checkOtp(literalOtp);

        if (isOtpValid) {
            try {
                appContext?.updateLoading(true);
                const { accessToken } = await authAPI.verifyOtp(email, literalOtp);

                //  Store accessToken in the Secure Store
                await saveToken('accessToken', accessToken);

                router.push("/reset-password");
            } catch (error) {
                errorContext?.handleError(error);
            } finally {
                appContext?.updateLoading(false);
            }
        }
    };

    const resendOtp = async () => {
        try {
            setLocalLoading(true);
            await authAPI.requestOtp(email);
            setTimer(120);
        } catch (error) {
            errorContext?.handleError(error);
        } finally {
            setLocalLoading(false);
        } 
    };

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
                <View style={[styles.timerContainer, { borderColor: theme.divider }]}>
                    { localLoading ? <ActivityIndicator color={theme.accent} size="small" /> : 
                        <ThemedText color={theme.secondaryText} fontSize={17} fontWeight="semibold" style={styles.timer}>
                            {formattedTimer}
                        </ThemedText>
                    }
                </View>
                <TouchableOpacity 
                    onPress={resendOtp}
                    touchSoundDisabled
                    activeOpacity={0.8}
                    disabled={localLoading || timer > 0 || appContext?.loading}
                >   
                    <ThemedText 
                        color={localLoading || timer > 0 ? theme.divider : theme.accent} 
                        fontSize={16} 
                        fontWeight="semibold"
                    >
                        Resend Code
                    </ThemedText>
                </TouchableOpacity>
                <ThemedButton
                    onPress={handleSubmit}
                    height={60}
                    width="100%"
                    backgroundColor={theme.accent}
                    disabled={appContext?.loading || localLoading}
                    style={styles.button}
                >
                    { appContext?.loading ? <ActivityIndicator color={theme.onAccent} size="large" /> :
                        <ThemedText color={theme.onAccent} fontSize={20} fontWeight="bold" >Verify</ThemedText>
                    }
                </ThemedButton>
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
        marginBottom: 18
    },
    timerContainer: {
        height: 30,
        width: 70,
        justifyContent: "center",
        borderWidth: 2.5,
        borderRadius: 15, 
        marginVertical: 8
    },
    timer: {
        textAlign: "center"
    },
    button: {
        marginTop: 30,
        marginBottom: 30
    }
});