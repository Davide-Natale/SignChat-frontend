import ThemedText from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import CheckIcon from '@/assets/icons/password-changed.svg';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedButton from '@/components/ThemedButton';

export default function PasswordChanged() {
    const theme = useTheme();
    const router = useRouter();
    const description = "Congratulations! You've successfully changed your password."

    return (
        <SafeAreaView style={[styles.main, { backgroundColor: theme.primary }]}>
            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <ThemedText color={theme.primaryText} fontSize={32} fontWeight="bold" style={styles.title}>
                        Password Changed
                    </ThemedText>
                    <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.description}>
                        {description}
                    </ThemedText>
                    <CheckIcon fill={theme.confirm} style={styles.image}/>
                    <ThemedButton
                        onPress={() => { router.replace("/") ; router.push("/login") }}
                        height={60}
                        width="100%"
                        backgroundColor={theme.accent}
                        style={styles.button}
                    >
                        <ThemedText color={theme.onAccent} fontSize={20} fontWeight="bold" >Back to Login</ThemedText>
                    </ThemedButton>
                </View>
            </ScrollView>
        </SafeAreaView>        
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    inner: {
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center"
    },
    container: {
        width: "90%",
        justifyContent: "center",
        alignItems: "center"
    },
    title: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 1,
        marginTop: 30
    },
    description: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 1,
        marginTop: 10
    },
    image: {
        marginVertical: 70
    },
    button: {
        marginBottom: 30
    },
});