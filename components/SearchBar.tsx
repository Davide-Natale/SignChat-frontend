import { useTheme } from '@/hooks/useTheme';
import { useRef } from 'react';
import { Pressable, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle, TextInput } from 'react-native';
import SearchIcon from "@/assets/icons/search.svg";
import ClearIcon from "@/assets/icons/clear.svg";

interface SearchBarProps {
    value: string,
    onChangeText: (text: string) => void
    clearValue: () => void;
    style?: StyleProp<ViewStyle>
}

export default function SearchBar({ value, onChangeText, clearValue, style }: SearchBarProps) {
    const theme = useTheme();
    const textInputRef = useRef<TextInput>(null);

    return (
        <View style={[styles.main, style]}>
            <Pressable
                onPress={() => {
                    textInputRef.current?.focus();
                }}
                android_disableSound
            >
                <View style={[styles.container, { backgroundColor: theme.onBackground }]} >
                    <SearchIcon stroke={theme.secondaryText}/>
                    <TextInput
                        ref={ textInputRef }
                        value={value}
                        onChangeText={onChangeText}
                        placeholder='Search'
                        placeholderTextColor={theme.secondaryText}
                        cursorColor={theme.accent}
                        autoCorrect={false}
                        autoCapitalize='none'
                        keyboardType='default'
                        returnKeyType='search'
                        style={[
                            styles.input, 
                            { 
                                color: theme.primaryText,
                                fontFamily: value !== "" ? 'inter_medium' : 'inter_regular',
                                marginHorizontal: 10,
                            }
                        ]}
                    />

                    { value !== "" ?
                        <TouchableOpacity
                            activeOpacity={0.8}
                            touchSoundDisabled
                            onPress={() => { 
                                clearValue();
                                textInputRef.current?.focus(); 
                            }}
                        >
                            <ClearIcon stroke={theme.primaryText} />
                        </TouchableOpacity> : null
                    }
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        width: "100%"
    },
    container: {
        height: 36,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        fontSize: 16
    }
});