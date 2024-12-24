import { Link, useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function PasswordChanged() {
    const router = useRouter();

    return (
        <View style={{flex: 1, justifyContent: "center"}}>
            <Button title='password-changed' onPress={() => { router.dismissTo("/login"); }}/>
        </View>
    );
}

const styles = StyleSheet.create({});