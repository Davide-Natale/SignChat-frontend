import { useColorScheme } from "react-native";
import { Colors, ThemeColors } from "@/constants/Color";

export function useTheme(): ThemeColors {
    const colorScheme = useColorScheme();
    return Colors[colorScheme || 'light'];
}