import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Image } from 'expo-image';
import ThemedButton from '@/components/ThemedButton';
import ThemedText from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import {  StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const theme = useTheme();
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <SafeAreaView style={[styles.main, { backgroundColor: theme.primary }]}>
            <ScrollView contentContainerStyle={styles.inner}>
                <View style={styles.container}>
                    <Image
                        source={require("@/assets/images/icon.png")}
                        style={styles.image}
                    />
                    <ThemedText color={theme.primaryText} fontSize={28} fontWeight="extrabold" style={styles.title}>
                        Create account
                    </ThemedText>
                    <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="medium" style={styles.description}>
                        Please sign up to continue.
                    </ThemedText>
                    <ThemedTextInput
                        value={email}
                        onChangeText={e => setEmail(e)}
                        placeholder='Email'
                    />
                    <ThemedTextInput
                        value={password}
                        onChangeText={p => setPassword(p)}
                        placeholder='Password'
                    />
                    <ThemedTextInput
                        value={confirmPassword}
                        onChangeText={p => setConfirmPassword(p)}
                        placeholder='Confirm Password'
                    />
                    <ThemedButton
                        onPress={async () => {
                            /*const success = await authContext?.register(email, password)
                            if (success) {
                                if (router.canDismiss()) {
                                    router.dismissAll();
                                }

                                router.replace("/calls");
                            }*/
                        }}
                        height={60}
                        width="100%"
                        shape="circular"
                        backgroundColor={theme.accent}
                        style={styles.button}
                    >
                        <ThemedText color={theme.onAccent} fontSize={18} fontWeight="bold" >Sign Up</ThemedText>
                    </ThemedButton>

                    <View style={styles.textGroup}>
                        <ThemedText color={theme.secondaryText} fontSize={15} fontWeight='regular'>
                            Already have an account?
                        </ThemedText>
                        <TouchableOpacity onPress={() => { router.replace("/login"); }}>
                            <ThemedText color={theme.accent} fontSize={15} fontWeight='medium' style={styles.text}>Login</ThemedText>
                        </TouchableOpacity>
                    </View>

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
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        width: "85%",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    image: {
        height: 150,
        width: 150,
        borderRadius: 35,
        elevation: 10,
        marginVertical: 60
    },
    title: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 1.5
    },
    description: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 1.2,
        marginLeft: 20,
        marginBottom: 20
    },
    button: {
        marginTop: 110,
        marginBottom: 12
    },
    textGroup: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 50,
    },
    text: {
        marginLeft: 5
    }
});