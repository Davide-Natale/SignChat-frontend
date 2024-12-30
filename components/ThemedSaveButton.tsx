import { useTheme } from '@/hooks/useTheme';
import ThemedText from '@/components/ThemedText';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

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