import { Tabs } from "expo-router";
import CallIcon from '@/assets/icons/call.svg';
import CallIconBold from '@/assets/icons/call-bold.svg';
import ContactIcon from '@/assets/icons/contact.svg';
import ContactIconBold from '@/assets/icons/contact-bold.svg';
import TranscriptionIcon from '@/assets/icons/transcription.svg';
import TranscriptionIconBold from '@/assets/icons/transcription-bold.svg';
import { useTheme } from "@/hooks/useTheme";

export default function TabLayout() {
    const theme = useTheme();

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: { backgroundColor: theme.secondary },
                tabBarActiveTintColor: theme.accent,
                tabBarInactiveTintColor: theme.secondaryText
            }}>
            <Tabs.Screen
                name="calls"
                options={{
                    title: 'Calls',
                    tabBarIcon: ({ focused, color }) => {
                        return (
                            focused ? <CallIconBold fill={color} /> :
                                <CallIcon stroke={color} />
                        );
                    }
                }}
            />
            <Tabs.Screen 
                name="contacts" 
                options={{ 
                    title: 'Contacts',
                    tabBarIcon: ({ focused, color }) => {
                        return (
                            focused ? <ContactIconBold fill={color} /> :
                                <ContactIcon stroke={color} />
                        );
                    } 
                }} 
            />
            <Tabs.Screen
                name="transcriptions"
                options={{
                    title: 'Transcriptions',
                    tabBarIcon: ({ focused, color }) => {
                        return (
                            focused ? <TranscriptionIconBold fill={color} /> :
                                <TranscriptionIcon stroke={color} />
                        );
                    }
                }}
            />
            <Tabs.Screen 
                name="profile"
                options={{
                    title: 'Profile'
                }}
            />
        </Tabs>
    );
}