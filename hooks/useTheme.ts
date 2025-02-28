import { useColorScheme } from "react-native";
import { Colors, ThemeColors } from "@/constants/Color";

export function useTheme(theme?: 'light' | 'dark'): ThemeColors {
    const colorScheme = useColorScheme();
    return Colors[theme || colorScheme || 'light'];
}