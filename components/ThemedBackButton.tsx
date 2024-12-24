import { TouchableOpacity } from "react-native";
import BackIcon from "@/assets/icons/back.svg";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function ThemedBackButton() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => { router.back(); }}
            touchSoundDisabled
            activeOpacity={0.8}
        >
            <BackIcon stroke={theme.accent} height={30} width={30} />  
        </TouchableOpacity>
    );
}