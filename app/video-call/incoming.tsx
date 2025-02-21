import { StyleSheet, Text, View } from 'react-native';

export default function IncomingVideoCall() {
    return (
        <View style={styles.main} >
            <Text>Incoming Video Call</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    main: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' , 
        backgroundColor: 'black'
    }
});