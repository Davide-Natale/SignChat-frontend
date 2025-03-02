export const Colors = {
    light: {
        primary: "#FFFFFF",
        secondary: "#F4F4F4",
        onBackground: "#E8E8E8",
        surface: "#F4F4F4",
        onSurface: "#FFFFFF",
        menu: "#FFFFFF",
        accent: "#007CFF",
        onAccent: "#FFFFFF",
        backgroundBlue: "#D6EBFF",
        textBlue: "#004A99",
        error: "#CA3B3B",
        warn: "#E6A800",
        confirm: "#4CAF50",
        primaryText: "#333333",
        secondaryText: "#666666",
        divider: "#D0D0D0"
    },
    dark: {
        primary: "#121212",
        secondary: "#2C2C2C",
        onBackground: "#404040",
        surface: "#121212",
        onSurface: "#2C2C2C",
        menu: "#363636",
        accent: "#4A90E2",
        onAccent: "#FFFFFF",
        backgroundBlue: "#102A46",
        textBlue: "#D6EBFF",
        error: "#FF4D4D",
        warn: "#FFC72C",
        confirm: "#388E3C",
        primaryText: "#D1D1D1",
        secondaryText: "#AAAAAA",
        divider: "#525252"
    }
}

export type ThemeColors = typeof Colors.light;

