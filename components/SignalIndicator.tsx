import { useTheme } from '@/hooks/useTheme';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type ConnectionQuality = 'Good' | 'Mid' | 'Low';

interface SignalIndicatorProps {
    connectionQuality: ConnectionQuality | undefined;
    style: StyleProp<ViewStyle>;
}

export default function SignalIndicator({ connectionQuality, style }: SignalIndicatorProps) {
    const darkTheme = useTheme('dark');

    return (
        <View style={[style, styles.signal]} >
            <View style={[
                styles.bar,
                {
                    height: 8,
                    backgroundColor: connectionQuality === 'Good' ? darkTheme.confirm :
                        connectionQuality === 'Mid' ? darkTheme.warn :
                            connectionQuality === 'Low' ? darkTheme.error : darkTheme.divider
                }
            ]}
            />
            <View style={[
                styles.bar,
                {
                    height: 14,
                    backgroundColor: connectionQuality === 'Good' ? darkTheme.confirm :
                        connectionQuality === 'Mid' ? darkTheme.warn : darkTheme.divider
                }
            ]}
            />
            <View style={[
                styles.bar,
                {
                    height: 20,
                    backgroundColor: connectionQuality === 'Good' ? darkTheme.confirm :
                        darkTheme.divider
                }
            ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    signal: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    bar: {
        width: 6,
        marginRight: 3,
        borderRadius: 2,
    },
});