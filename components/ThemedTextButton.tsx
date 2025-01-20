import { useTheme } from '@/hooks/useTheme';
import ThemedText from '@/components/ThemedText';
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';

interface ThemedTextButtonProps {
    text: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>
}

export default function ThemedTextButton({ text, onPress, style }: ThemedTextButtonProps) {
    const theme = useTheme();
    const appContext = useContext(AppContext);

    return (
        appContext?.loading ? <ActivityIndicator color={theme.accent} size="large" /> :
            <TouchableOpacity
                onPress={onPress}
                touchSoundDisabled
                activeOpacity={0.8}
                style={style}
            >
                <ThemedText color={theme.accent} fontSize={17} fontWeight="semibold" >
                    {text}
                </ThemedText>
            </TouchableOpacity>
    );
}