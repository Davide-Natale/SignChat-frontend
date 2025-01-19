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
import ImageProfile from "@/components/ImageProfile";
import OptionsMenu from "@/components/OptionsMenu";

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
                //  No need to do anything: unable to update preferences
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
                    fontSize: 20,
                    color: theme.primaryText 
                },
                headerShadowVisible: false,
                headerStyle: { backgroundColor: theme.surface },
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
                    headerTitleStyle: { 
                        fontFamily: "inter_bold",
                        fontSize: 30,
                        color: theme.primaryText 
                    },
                    headerTitleAlign: 'left',
                    tabBarIcon: ({ focused, color }) => {
                        return(
                            focused ? <CallIconBold fill={color} /> :
                                <CallIcon stroke={color} />
                        );
                    },
                    headerRight: () => <OptionsMenu /> 
                }}
            />
            <Tabs.Screen 
                name="contacts" 
                options={{
                    title: 'Contacts',
                    headerTitleStyle: { 
                        fontFamily: "inter_bold",
                        fontSize: 30,
                        color: theme.primaryText 
                    },
                    headerTitleAlign: 'left',
                    tabBarIcon: ({ focused, color }) => {
                        return(
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
                        return(
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
                    tabBarIcon: ({ color }) => {
                        return(
                            <ImageProfile 
                                uri={authContext?.user?.imageProfile ?? null}
                                size={24}
                                style={{ 
                                    borderRadius: 12, 
                                    borderColor: color, 
                                    borderWidth: 1.75 
                                }}
                            />
                        );
                    }
                }}
            />
        </Tabs>
    );
}