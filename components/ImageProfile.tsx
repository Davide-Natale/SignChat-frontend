import { useTheme } from '@/hooks/useTheme';
import { StyleProp, StyleSheet, useColorScheme, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import ThemedButton from "@/components/ThemedButton";
import EditIconBold from "@/assets/icons/edit-bold.svg";

interface ImageProfileProps {
    uri: string | null;
    size: number;
    showEdit?: boolean;
    onEditPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export default function ImageProfile({ uri, size, showEdit = false, onEditPress, style }: ImageProfileProps) {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const placeholder = colorScheme === 'dark' ? require("@/assets/images/profile-placeholder-dark.png") :
        require("@/assets/images/profile-placeholder-light.png");

    return (
        <View style={[style, styles.main, { height: size, width: size }]}>
            <Image
                source={ uri ? { uri } : placeholder }
                style={[styles.image, { borderRadius: size / 2 }]}
            />
            { showEdit && onEditPress ? 
                <View style={[styles.icon, 
                        { 
                            backgroundColor: theme.primary, 
                            borderRadius: size * 0.25 / 2
                        }
                    ]}
                >
                    <ThemedButton
                        onPress={onEditPress}
                        height={size * 0.25}
                        width={size * 0.25}
                        shape="circular"
                        type='outlined'
                        borderColor={theme.primary}
                        backgroundColor={theme.accent}
                    >
                        <EditIconBold fill={theme.onAccent} height={size * 0.15} width={size * 0.15}/>
                    </ThemedButton>
                </View> : null
            }
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        justifyContent: "flex-end",
        alignItems: "flex-end"
    },
    image: {
        height: "100%",
        width: "100%"
    },
    icon: {
        position: "absolute"
    }
});