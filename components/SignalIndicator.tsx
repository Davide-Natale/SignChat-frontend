import { useTheme } from '@/hooks/useTheme';
import { ConnectionQuality } from '@/types/ConnectionQuality';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface SignalIndicatorProps {
    height: number;
    connectionQuality: ConnectionQuality | undefined;
    style?: StyleProp<ViewStyle>;
}

export default function SignalIndicator({ height, connectionQuality, style }: SignalIndicatorProps) {
    const darkTheme = useTheme('dark');
    const width = height / 3;
    const borderRadius = width / 3;
    const marginRight = width / 2;
    const bars = [
        {
            height: height / 2.5,
            backgroundColor: connectionQuality === 'Good' ? darkTheme.confirm :
                connectionQuality === 'Mid' ? darkTheme.warn :
                    connectionQuality === 'Low' ? darkTheme.error : darkTheme.divider
        },
        {
            height: height / 1.5,
            backgroundColor: connectionQuality === 'Good' ? darkTheme.confirm :
                connectionQuality === 'Mid' ? darkTheme.warn : darkTheme.divider
        },
        {
            height,
            backgroundColor: connectionQuality === 'Good' ? darkTheme.confirm :
                darkTheme.divider
        }
    ]

    return (
        <View style={[style, styles.signal]} >
            { bars.map((bar, index) => (
                <View
                    key={index}
                    style={
                        {
                            width,
                            height: bar.height,
                            borderRadius,
                            marginRight,
                            backgroundColor: bar.backgroundColor
                        }
                    }
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    signal: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
    }
});