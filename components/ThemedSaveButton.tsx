import { useTheme } from '@/hooks/useTheme';
import ThemedText from '@/components/ThemedText';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ThemedSaveButtonProps {
    onPress: () => void
}

export default function ThemedSaveButton({ onPress }: ThemedSaveButtonProps) {
    const theme = useTheme();

    return (
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