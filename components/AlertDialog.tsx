import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Modal, StyleSheet, View, TouchableWithoutFeedback, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '@/components/ThemedText';

interface AlertDialogProps {
    showDialog: boolean;
    title: string;
    content: string;
    confirmText: string;
    onConfirm: () => void;
    onDismiss: () => void;
}

export default function AlertDialog(
    {
        showDialog,
        title,
        content,
        confirmText,
        onConfirm,
        onDismiss,
    }: AlertDialogProps
) {
    const theme = useTheme();

    return (
        <Modal
            transparent
            visible={showDialog}
            animationType="fade"
            onRequestClose={onDismiss}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={onDismiss}>
                <SafeAreaView style={styles.backdrop}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.dialog, { backgroundColor: theme.onSurface }]}>
                            <ThemedText
                                color={theme.primaryText}
                                fontSize={24}
                                fontWeight="medium"
                                numberOfLines={1}
                                style={styles.title}
                            >
                                {title}
                            </ThemedText>
                            <ThemedText
                                color={theme.secondaryText}
                                fontSize={14}
                                fontWeight="regular"
                                style={styles.content}
                            >
                                {content}
                            </ThemedText>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    onPress={onDismiss}
                                    touchSoundDisabled
                                    activeOpacity={0.8}
                                >
                                    <ThemedText color={theme.accent} fontSize={14} fontWeight='semibold' style={styles.dismissButton}>
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
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    dialog: {
        width: "80%",
        borderRadius: 28,
        padding: 25
    },
    title: {
        marginBottom: 15
    },
    content: {
        marginBottom: 20
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }, 
    dismissButton: {
        marginRight: 25
    }
});
