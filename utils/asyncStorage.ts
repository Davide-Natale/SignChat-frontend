import AsyncStorage from '@react-native-async-storage/async-storage';

export const savePreference = async (key: string, value: boolean) => {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
};

export const getPreference = async (key: string) => {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
};