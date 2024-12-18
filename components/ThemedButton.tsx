import React from 'react';
import { StyleProp, ViewStyle, Pressable, DimensionValue, TouchableOpacity } from 'react-native';

interface ThemedButtonProps {
    onPress: () => void
    type?: "filled" | "outlined"
    shape?: 'rounded' | "circular"
    height?: DimensionValue
    width?: DimensionValue
    borderColor?: string
    backgroundColor: string
    children: React.ReactNode
    style?: StyleProp<ViewStyle>
}

export default function ThemedButton(
    {
        onPress,
        type = "filled",
        shape = "rounded",
        height,
        width,
        borderColor,
        backgroundColor,
        children,
        style
    }: ThemedButtonProps
) {
    let borderRadius = 8;

    if(shape === "circular" && height) {
        borderRadius = parseInt(height.toString()) / 2;
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            touchSoundDisabled
            style={[style, 
                {
                    height,
                    width,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor,
                    borderRadius,
                    borderColor: borderColor,
                    borderWidth: type === "outlined" ? 2.5 : undefined
                }
            ]}
        >
            {children}
        </TouchableOpacity>
    );
}