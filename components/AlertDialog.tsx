import { StyleSheet, TouchableOpacity } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import ThemedText from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';

interface AlertDialogProps {
    showDialog: boolean
    title: string
    content: string
    confirmText: string
    onConfirm: () => void
    onDismiss: () => void
}

export default function AlertDialog(
    {
        showDialog,
        title,
        content,
        confirmText,
        onConfirm,
        onDismiss
    }: AlertDialogProps
) {
    const theme = useTheme();

    return (
        <Portal>
            <Dialog
                visible={showDialog}
                onDismiss={onDismiss}
                style={[styles.dialog, { backgroundColor: theme.onSurface }]}
            >
                <Dialog.Title>
                    <ThemedText
                        color={theme.primaryText}
                        fontSize={24}
                        fontWeight="medium"
                        numberOfLines={1}
                    >
                        {title}
                    </ThemedText>
                </Dialog.Title>
                <Dialog.Content>
                    <ThemedText
                        color={theme.secondaryText}
                        fontSize={14}
                        fontWeight="regular"
                    >
                        {content}
                    </ThemedText>
                </Dialog.Content>
                <Dialog.Actions>
                    <TouchableOpacity
                        onPress={onDismiss}
                        touchSoundDisabled
                        activeOpacity={0.8}
                    >
                        <ThemedText color={theme.accent} fontSize={14} fontWeight='semibold' style={styles.dismissText}>
                            Cancel
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onConfirm}
                        touchSoundDisabled
                        activeOpacity={0.8}
                    >
                        <ThemedText color={theme.accent} fontSize={14} fontWeight='semibold'>{confirmText}</ThemedText>
                    </TouchableOpacity>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialog: {
        width: "80%",
        alignSelf: "center",
    },
    dismissText: {
        marginRight: 15
    }
});