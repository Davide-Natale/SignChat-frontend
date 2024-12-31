import { Tabs } from "expo-router";
import CallIcon from '@/assets/icons/call.svg';
import CallIconBold from '@/assets/icons/call-bold.svg';
import ContactIcon from '@/assets/icons/contact.svg';
import ContactIconBold from '@/assets/icons/contact-bold.svg';
import TranscriptionIcon from '@/assets/icons/transcription.svg';
import TranscriptionIconBold from '@/assets/icons/transcription-bold.svg';
import { useTheme } from "@/hooks/useTheme";
import { useContext, useEffect } from "react";
import { AppContext } from "@/contexts/AppContext";
import { AuthContext } from "@/contexts/AuthContext";

export default function TabLayout() {
    const theme = useTheme();
    const appContext = useContext(AppContext);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        const checkPreferences = async () => {
            try {
                if(appContext?.isNotificationsEnabled === null || appContext?.isAccessibilityEnabled === null) {
                    //  If preferences are not set yet, initialize them with default values.
                    await appContext.updateNotifications(false);
                    await appContext.updateAccessibility(true);
                }
            } catch (error) {
                //  Handle error
                console.log(error);
            }
        };
        
        checkPreferences();
    }, []);

    useEffect(() => {
        authContext?.fetchProfile();
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerTitleAlign: "center",
                headerTitleStyle: { 
                    fontFamily: "inter_bold",
                    fontSize: 19,
                    color: theme.primaryText 
                },
                headerStyle: { backgroundColor: theme.secondary },
                tabBarStyle: { 
                    borderTopWidth: undefined, 
                    backgroundColor: theme.secondary,
                    elevation: 10
                },
                tabBarLabelStyle: { fontFamily: "inter_regular" },
                tabBarActiveTintColor: theme.accent,
                tabBarInactiveTintColor: theme.secondaryText,
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
                    title: 'Profile',
                    headerStyle: { backgroundColor: theme.surface },
                    headerShadowVisible: false
                }}
            />
        </Tabs>
    );
}