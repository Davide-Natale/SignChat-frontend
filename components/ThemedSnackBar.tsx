import { ErrorContext } from '@/contexts/ErrorContext';
import { useTheme } from '@/hooks/useTheme';
import { useContext } from 'react';
import { Portal, Snackbar } from 'react-native-paper';
import ThemedText from '@/components/ThemedText';

export default function ThemedSnackBar() {
    const theme = useTheme();
    const errorContext = useContext(ErrorContext);

    return (
        <Portal>
            <Snackbar
                visible={errorContext?.showErrMsg ?? false}
                onDismiss={() => errorContext?.clearErrMsg()}
                onIconPress={() => errorContext?.clearErrMsg()}
                elevation={0}
            >
                <ThemedText color={theme.onAccent} fontSize={13} fontWeight="medium">
                    {errorContext?.errMsg}
                </ThemedText>
            </Snackbar>
        </Portal>
    );
}