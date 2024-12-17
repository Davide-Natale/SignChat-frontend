import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
    const theme = useTheme();
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const [email, setEmail] = useState("davide.natale@polito.it");
    const [password, setPassword] = useState("Aa0?aaaa");
    const [confirmPassword, setConfirmPassword] = useState("Aa0?aaaa");

    return (
    <View style={[styles.main, { backgroundColor: theme.primary }]}>
        <TextInput 
            value={email} 
            onChangeText={e => { setEmail(e); }} 
            placeholder='Email'
            keyboardType='email-address'
            style={[styles.textInput, { backgroundColor: theme.secondary , borderColor: theme.divider }]}
        />

        <TextInput 
            value={password} 
            onChangeText={p => { setPassword(p); }} 
            placeholder='Password' 
            secureTextEntry
            style={[styles.textInput, { backgroundColor: theme.secondary , borderColor: theme.divider }]}
        />

        <TextInput 
            value={confirmPassword} 
            onChangeText={p => { setConfirmPassword(p); }} 
            placeholder='Confirm Password' 
            secureTextEntry
            style={[styles.textInput, { backgroundColor: theme.secondary , borderColor: theme.divider }]}
        />

        <Button 
            title='Sign Up' 
            onPress={async () => { 
                const success = await authContext?.register(email, password)
                if(success) {
                    if(router.canDismiss()) {
                        router.dismissAll();
                    }
                    
                    router.replace("/calls");
                }                 
            }} 
        />

        <View style={styles.textGroup}>
            <Text style={[styles.text1, { color: theme.primaryText }]}>Already have an account?</Text>
            <TouchableOpacity onPress={() => { router.replace("/login"); }}>
                <Text style={[styles.text2, { color: theme.accent }]}> Sign In</Text>
            </TouchableOpacity>
        </View>
    </View>
    );
}

const styles = StyleSheet.create({
    main: {
        width: "100%",
        height: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    textInput: {
        height: 60,
        width: "80%",
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 10,
        margin: 10
    },
    textGroup: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        margin: 30
    },
    text1: {
        fontFamily: "inter_regular",
        fontSize: 15
    },
    text2: {
        fontFamily: "inter_medium",
        fontSize: 15
    }
});