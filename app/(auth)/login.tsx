import ThemedButton from '@/components/ThemedButton';
import ThemedText from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useContext, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView,TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import EmailIcon from "@/assets/icons/email-bold.svg";
import LockIcon from "@/assets/icons/lock-bold.svg";

export default function Login() {
    const theme = useTheme();
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const [passwordErrMsg, setPasswordErrMsg] = useState("");
    const textInputRef2 = useRef<TextInput>(null);

    return (
        <SafeAreaView style={[styles.main, { backgroundColor: theme.primary }]}>
            <ScrollView 
                contentContainerStyle={styles.inner} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
              <View style={styles.container}>
                <Image 
                  source={require("@/assets/images/icon.png")} 
                  style={styles.image} 
                />
                <ThemedText color={theme.primaryText} fontSize={28} fontWeight="extrabold" style={styles.title}>
                  Welcome back!
                </ThemedText>
                <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="medium" style={styles.description}>
                  Please log in to continue.
                </ThemedText>
                <ThemedTextInput
                    value={email}
                    onChangeText={e => setEmail(e)}
                    clearValue={() => setEmail("")}
                    errMsg={emailErrMsg}
                    placeholder='Email'
                    leadingIcon={<EmailIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='email-address'
                    returnKeyType="next"
                    onSubmitEditing={() => textInputRef2.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef2}
                    value={password}
                    onChangeText={p => setPassword(p)}
                    errMsg={passwordErrMsg}
                    secureTextEntry
                    placeholder='Password'
                    leadingIcon={<LockIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='default'
                    returnKeyType='done'
                    onSubmitEditing={() => { /*TODO: add the same handler of confirm button*/ }}
                />
                <ThemedButton
                  onPress={async () => {
                    /*const success = await authContext?.login(email, password);
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
                  <ThemedText color={theme.onAccent} fontSize={18} fontWeight="bold" >Login</ThemedText>
                </ThemedButton>

                <View style={styles.textGroup}>
                    <ThemedText color={theme.secondaryText} fontSize={15} fontWeight='regular'>
                        Don't have an account?
                    </ThemedText>
                    <TouchableOpacity onPress={() => { router.replace("/register"); }}>
                        <ThemedText color={theme.accent} fontSize={15} fontWeight='medium' style={styles.text}>Sign Up</ThemedText>
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
        letterSpacing: 1
    },
    description: {
        width: "100%",
        textAlign: "left",
        letterSpacing: 1,
        marginLeft: 20, 
        marginBottom: 20
    },
    button: {
        marginTop: 200,
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