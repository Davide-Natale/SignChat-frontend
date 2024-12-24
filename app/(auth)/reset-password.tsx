import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ResetPassword() {
    return (
        <View>
            <Link href="/password-changed"><Text>reset-password</Text></Link>
        </View>
    );
}

const styles = StyleSheet.create({});