import React, { useRef, useState } from 'react';
import { TextInputProps, StyleSheet, View, TextInput, Pressable, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import ClearIcon from "@/assets/icons/clear.svg";
import EyeIcon from "@/assets/icons/eye.svg";
import EyeOffIcon from "@/assets/icons/eye-off.svg";
import ThemedText from '@/components/ThemedText';
import DangerIcon from "@/assets/icons/danger.svg";

type ThemedTextInputProps = TextInputProps & {
    errMsg: string
    leadingIcon?: React.ReactNode
    clearValue?: () => void,
    externalRef?: React.RefObject<TextInput>
}

export default function ThemedTextInput({ errMsg, leadingIcon, clearValue, externalRef, ...rest }: ThemedTextInputProps) {
    const theme = useTheme();
    const textInputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const borderColor = errMsg !== "" ? theme.error : isFocused ? theme.accent : theme.divider; 

    return (
        <View style={styles.main}>
            <Pressable
                onPress={() => {
                    setIsFocused(true);
                    if(externalRef) {
                        externalRef.current?.focus();
                    } else {
                        textInputRef.current?.focus(); 
                    }
                }}
                android_disableSound
            >
                <View style={[styles.container, { backgroundColor: theme.secondary, borderColor }]} >
                    {leadingIcon}
                    <TextInput
                        {...rest}
                        ref={ externalRef ? externalRef : textInputRef }
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholderTextColor={theme.primaryText}
                        cursorColor={errMsg !== "" ? theme.error : theme.accent}
                        secureTextEntry={rest.secureTextEntry && !isPasswordVisible}
                        style={[
                            styles.input, 
                            { 
                                color: theme.secondaryText,
                                fontFamily: rest.value !== "" ? 'inter_regular' : 'inter_medium',
                                marginHorizontal: leadingIcon ? 10 : 2,
                            }
                        ]}
                    />

                    {!rest.secureTextEntry && rest.value !== "" ?
                        <TouchableOpacity
                            activeOpacity={0.8}
                            touchSoundDisabled
                            onPress={() => { 
                                if (clearValue) { clearValue(); }
                                setIsFocused(true);
                                if(externalRef) {
                                    externalRef.current?.focus();
                                } else {
                                    textInputRef.current?.focus(); 
                                }
                            }}
                        >
                            <ClearIcon stroke={theme.primaryText} />
                        </TouchableOpacity> : null
                    }

                    {rest.secureTextEntry ?
                        <TouchableOpacity
                            activeOpacity={0.8}
                            touchSoundDisabled
                            onPress={() => setIsPasswordVisible(prev => !prev)}
                        >
                            {isPasswordVisible ?
                                <EyeOffIcon stroke={theme.primaryText} /> :
                                <EyeIcon stroke={theme.primaryText} />
                            }
                        </TouchableOpacity> : null
                    }
                </View>
            </Pressable>
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
        height: 60,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        borderWidth: 1.5,
        borderRadius: 20,
        paddingHorizontal: 12
    },
    input: {
        flex: 1,
        fontSize: 16
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