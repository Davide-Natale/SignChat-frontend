import { useTheme } from '@/hooks/useTheme';
import ThemedText from '@/components/ThemedText';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';

interface ThemedSaveButtonProps {
    onPress: () => void;
}

export default function ThemedSaveButton({ onPress }: ThemedSaveButtonProps) {
    const theme = useTheme();
    const appContext = useContext(AppContext);

    return (
        appContext?.loading ? <ActivityIndicator color={theme.accent} size="large" /> :
            <TouchableOpacity
                onPress={onPress}
                touchSoundDisabled
                activeOpacity={0.8}
            >
                <ThemedText color={theme.accent} fontSize={17} fontWeight="semibold" >
                    Save
                </ThemedText>
            </TouchableOpacity>
    );
}

const styles = StyleSheet.create({});