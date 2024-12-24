import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ForgotPassword() {
    return (
        <View>
            <Link href="/verify-otp"><Text>forgot-password</Text></Link>
        </View>
    );
}

const styles = StyleSheet.create({});