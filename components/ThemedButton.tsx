import React from 'react';
import { StyleProp, ViewStyle, DimensionValue, TouchableOpacity } from 'react-native';

interface ThemedButtonProps {
    onPress: () => void
    type?: "filled" | "outlined"
    shape?: 'rounded' | "circular"
    height?: DimensionValue
    width?: DimensionValue
    borderColor?: string
    backgroundColor: string
    disabled?: boolean
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
        disabled = false,
        children,
        style
    }: ThemedButtonProps
) {
    let borderRadius = 8;

    if(height) {
        borderRadius = shape === 'circular' ? 
            parseInt(height?.toString()) / 2 : parseInt(height?.toString()) / 4;
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
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