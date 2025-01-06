import { useTheme } from '@/hooks/useTheme';
import { DimensionValue, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface DividerProps {
    height: DimensionValue;
    width: DimensionValue;
    style?: StyleProp<ViewStyle>;
}

export default function Divider({ height, width, style }: DividerProps) {
    const theme = useTheme();

    return (
        <View style={[style, { height, width, backgroundColor: theme.divider }]} />
    );
}