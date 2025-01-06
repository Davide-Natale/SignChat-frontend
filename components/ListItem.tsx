import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ListItemProps {
    headlineContent: React.ReactNode;
    leadingContent?: React.ReactNode;
    trailingContent?: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export default function ListItem({ headlineContent, leadingContent, trailingContent, onPress, style }: ListItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            touchSoundDisabled
            activeOpacity={0.5}
            disabled={onPress === undefined}
            style={styles.pressable}
        >
            <View style={[style, styles.row]}>
                {leadingContent ? 
                    <View style={styles.group} >
                        {leadingContent}
                        {headlineContent}
                    </View> : headlineContent}
                {trailingContent}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    pressable: {
        width: "100%"
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    group: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    }
});