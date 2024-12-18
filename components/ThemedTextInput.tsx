import React, { useRef, useState } from 'react';
import { TextInputProps, StyleSheet, View, TextInput, Pressable, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Logo from '@/assets/icons/transcription-bold.svg';
import { StyleProps } from 'react-native-reanimated';

type ThemedTextInputProps = TextInputProps 

export default function ThemedTextInput({ ...rest }: ThemedTextInputProps) {
    const theme = useTheme();
    const textInputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    const borderColor = errMsg? theme.error : isFocused? theme.accent : theme.divider;

    return (
        <Pressable 
            onPress={() => {
                setIsFocused(true);
                textInputRef.current?.focus();
                }
            }
        >
            <View style={
                { 
                    height: 60,
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderRadius: 30,
                    paddingHorizontal: 15,
                    marginVertical: 15,
                    backgroundColor: theme.secondary, 
                    borderColor
                }
            }>
                <Logo fill={theme.secondaryText} />
                <TextInput
                    ref={textInputRef}

                    {...rest}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={theme.secondaryText}
                    style={{
                        flex: 1,
                        fontFamily: 'inter_black',
                        marginHorizontal: 10
                    }} />
            </View>
        </Pressable>

    )
}

const styles = StyleSheet.create({
    input: {
        
    }
});