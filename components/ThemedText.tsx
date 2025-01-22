import { StyleProp, Text, TextStyle } from 'react-native';

interface ThemedTextProps {
    color: string;
    fontSize: number;
    numberOfLines?: number;
    children: React.ReactNode;
    fontWeight: "black" | "extrabold" | "bold" | "semibold" |
        "medium" | "regular" | "light" | "extralight" | "thin";
    style?: StyleProp<TextStyle>;
}

export default function ThemedText(
    {
        color,
        fontSize,
        numberOfLines = 0,
        children,
        fontWeight,
        style
    }: ThemedTextProps
) {
    return (
        <Text
            numberOfLines={numberOfLines}
            style={[
                {
                    color,
                    fontSize,
                    fontFamily: `inter_${fontWeight}`,
                }, 
                style
            ]}
        >
            {children}
        </Text>
    );
}