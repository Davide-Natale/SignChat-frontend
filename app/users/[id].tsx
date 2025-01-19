import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function InfoUser() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View>
            <Text>{"User" + id}</Text>
        </View>
    );
}

const styles = StyleSheet.create({});