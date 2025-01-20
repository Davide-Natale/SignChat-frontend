import { useTheme } from '@/hooks/useTheme';
import { Call } from '@/types/Call';
import { StyleProp, StyleSheet, View, ViewStyle, TouchableOpacity, useColorScheme } from 'react-native';
import ListItem from '@/components/ListItem';
import ImageProfile from '@/components/ImageProfile';
import Divider from '@/components/Divider';
import VideoCallInLight from "@/assets/icons/videoCallIn-light.svg";
import VideoCallInDark from "@/assets/icons/videoCallIn-dark.svg";
import VideoCallOutLight from "@/assets/icons/videoCallOut-light.svg";
import VideoCallOutDark from "@/assets/icons/videoCallOut-dark.svg";
import VideoCallMissedLight from "@/assets/icons/videoCallMissed-light.svg";
import VideoCallMissedDark from "@/assets/icons/videoCallMissed-dark.svg";
import InfoIcon from "@/assets/icons/info.svg";
import { formatDate } from '@/utils/dateUtils';
import React from 'react';
import ThemedText from '@/components/ThemedText';
import { router } from 'expo-router';

interface CallsCardProps {
    label?: string;
    calls: Call[];
    style?: StyleProp<ViewStyle>;
}

export default function CallsCard({ label, calls, style }: CallsCardProps) {
    const theme = useTheme();
    const scheme = useColorScheme();

    if(calls.length === 0) {
        return null;
    }

    return (
        <View style={[styles.main, style]}>
            { label ?
                <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.label}>
                    {label}
                </ThemedText> : null
            }
            
            <View style={[styles.surface, { backgroundColor: theme.onSurface }]}>
                {   calls.map((call, index) => {
                        const iconSize = 20;
                        const onPress = call.contact?.user || call.user ? () => { /* TODO: implement to call user */ } : undefined;
                        const contactFullName = call.contact?.lastName ? `${call.contact.firstName} ${call.contact.lastName ?? ""}` : call.contact?.firstName;
                        const userFullName = call.user ? call.user.firstName + " " + call.user.lastName : null;
                        const fullNameColor = call.status === "missed" ? theme.error : theme.primaryText;
                        const iconComponents = {
                            light: {
                                missed: VideoCallMissedLight,
                                incoming: VideoCallInLight,
                                outgoing: VideoCallOutLight,
                            },
                            dark: {
                                missed: VideoCallMissedDark,
                                incoming: VideoCallInDark,
                                outgoing: VideoCallOutDark,
                            },
                        };

                        const IconComponent = iconComponents[scheme ?? 'light'][call.status === "missed" ? "missed" : call.type];

                        return (
                            <React.Fragment key={call.id}>
                                <ListItem
                                    leadingContent={
                                        <ImageProfile
                                            uri={call.contact?.user ? call.contact?.user.imageProfile : call.user ? call.user.imageProfile : null}
                                            size={42}
                                            style={styles.image}
                                        />
                                    }
                                    headlineContent={
                                        <View>
                                            <ThemedText color={fullNameColor} fontSize={15} fontWeight="medium" numberOfLines={1} >
                                                {contactFullName ?? call.phone}
                                            </ThemedText>
                                            {userFullName ?
                                                <ThemedText color={fullNameColor} fontSize={15} fontWeight='medium' numberOfLines={1}>
                                                    {"~" + userFullName}
                                                </ThemedText> : null
                                            }
                                            <View style={styles.groupContainer}>
                                                <IconComponent height={iconSize} width={iconSize} />
                                                <ThemedText
                                                    color={theme.secondaryText}
                                                    fontSize={12}
                                                    fontWeight='medium'
                                                    numberOfLines={1}
                                                    style={styles.date}
                                                >
                                                    {formatDate(call.date)}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    }
                                    trailingContent={
                                        <TouchableOpacity
                                            onPress={() => router.push({ pathname: "/calls/[id]", params: { id: call.id } })}
                                            touchSoundDisabled
                                            activeOpacity={0.8}
                                        >
                                            <InfoIcon
                                                height={28}
                                                width={28}
                                                stroke={theme.primaryText}
                                                style={styles.infoIcon}
                                            />
                                        </TouchableOpacity>

                                    }
                                    onPress={onPress}
                                    style={styles.row}
                                />
                                {index < calls.length - 1 ? <Divider height={0.5} width="83%" style={styles.divider} /> : null}
                            </React.Fragment>
                        );
                    })
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        width: "100%"
    },
    label: {
        marginHorizontal: 8,
        marginBottom: 5,
        alignSelf: "flex-start"
    },
    surface: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderRadius: 15
    },
    row: {
        marginVertical: 8,
        paddingHorizontal: "3.5%",
    },
    image: {
        marginRight: 15
    },
    groupContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    infoIcon: {
        marginRight: 5
    },
    date: {
        marginLeft: 5
    },
    divider: {
        alignSelf: "flex-end"
    }
});