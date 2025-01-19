import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function InfoCall() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View>
            <Text>{"Call" + id}</Text>
        </View>
    );
}

const styles = StyleSheet.create({});