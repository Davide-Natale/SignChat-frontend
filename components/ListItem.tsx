import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ListItemProps {
    headlineContent: React.ReactNode
    leadingContent?: React.ReactNode
    trailingContent?: React.ReactNode
    onPress?: () => void
    style?: StyleProp<ViewStyle>
}

export default function ListItem({ headlineContent, leadingContent, trailingContent, onPress, style }: ListItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            touchSoundDisabled
            activeOpacity={0.5}
            disabled={onPress === undefined}
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
    row: {
        width: "100%",
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