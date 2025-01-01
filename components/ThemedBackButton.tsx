import BackIcon from "@/assets/icons/back.svg";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useContext } from "react";
import { AppContext } from "@/contexts/AppContext";

export default function ThemedBackButton() {
    const theme = useTheme();
    const router = useRouter();
    const appContext = useContext(AppContext);

    return (
        <TouchableOpacity
            onPress={() => { router.back(); }}
            touchSoundDisabled
            activeOpacity={0.8}
            disabled={appContext?.loading}
        >
            <BackIcon stroke={theme.accent} height={30} width={30} />  
        </TouchableOpacity>
    );
}