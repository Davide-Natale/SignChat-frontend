import { Contact } from '@/types/Contact';
import { StyleSheet, Text, View } from 'react-native';

interface ContactsCardProps {
    label?: string;
    contacts: Contact[];
}

//  TODO: implement

export default function ContactsCard({ label, contacts }: ContactsCardProps) {
    return (
        <View>
            <Text>ContactsCard</Text>
        </View>
    );
}

const styles = StyleSheet.create({});