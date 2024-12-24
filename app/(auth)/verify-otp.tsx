import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function VerifyOtp() {
    return (
        <View>
            <Link href="/reset-password"><Text>verify-otp</Text></Link>
        </View>
    );
}

const styles = StyleSheet.create({});