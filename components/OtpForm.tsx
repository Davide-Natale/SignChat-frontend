import { useTheme } from '@/hooks/useTheme';
import ThemedText from '@/components/ThemedText';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import DangerIcon from "@/assets/icons/danger.svg";

interface OtpFormProps {
    otp: string[]
    setOtp: React.Dispatch<React.SetStateAction<string[]>>
    errMsg: string
    handleSubmit: () => void
}

export default function OtpForm({ otp, setOtp, errMsg, handleSubmit }: OtpFormProps) {
    const theme = useTheme();
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const handleChange = (newValue: string, index: number) => {
        //  Update OTP
        setOtp(prevOtp => prevOtp.map((value, idx) => idx === index ? newValue : value));

        //  Move to next input field if current is filled
        if (newValue !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (index: number) => {
        // Move focus to previous input if the current field is empty and clear it
        if (otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
            setOtp(prevOtp => prevOtp.map((value, idx) => idx === index - 1 ? "" : value));
        }
    };

    return (
        <View style={styles.main} >
            <View style={styles.container}>
                { otp.map((value, index) => {
                    const borderColor = errMsg !== "" ? theme.error : focusedIndex === index ? theme.accent : theme.divider;

                    return (
                        <Pressable
                            key={index}
                            onPress={() => { setFocusedIndex(index); inputRefs.current[index]?.focus() }}
                            android_disableSound
                        >
                            <View
                                key={index}
                                style={[styles.inputContainer, { backgroundColor: theme.secondary, borderColor }]}
                            >
                                <TextInput
                                    key={index}
                                    value={value}
                                    onChangeText={newValue => handleChange(newValue, index)}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    maxLength={1}
                                    textAlign="center"
                                    cursorColor={errMsg !== "" ? theme.error : theme.accent}
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === "Backspace") {
                                            handleBackspace(index);
                                        }
                                    }}
                                    onSubmitEditing={handleSubmit}
                                    ref={el => inputRefs.current[index] = el}
                                    style={[
                                        styles.input, 
                                        { color: theme.secondaryText}
                                    ]}
                                />
                            </View>
                        </Pressable>
                    );
                })}
            </View>
            <View style={styles.textGroup}>
                { errMsg !== "" ? <DangerIcon stroke={theme.error} /> : null }
                <ThemedText color={theme.error} fontSize={13} fontWeight="medium" style={styles.supportingText}>
                    {errMsg}
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        width: "100%",
        marginTop: 12
    },
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    inputContainer: {
        height: 60,
        width: 50,
        justifyContent: "center",
        borderWidth: 2.5,
        borderRadius: 15,
    },
    input: {
        flex: 1,
        fontFamily: "inter_medium",
        fontSize: 20
    },
    textGroup: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        marginHorizontal: 3
    },
    supportingText: {         
        marginLeft: 5
    }
});