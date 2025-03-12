import { useTheme } from '@/hooks/useTheme';
import { Call } from '@/types/Call';
import { StyleProp, StyleSheet, View, ViewStyle, TouchableOpacity, useColorScheme, FlatList } from 'react-native';
import ListItem from '@/components/ListItem';
import ImageProfile from '@/components/ImageProfile';
import Divider from '@/components/Divider';
import VideoCallInLight from "@/assets/icons/videoCallIn-light.svg";
import VideoCallInDark from "@/assets/icons/videoCallIn-dark.svg";
import VideoCallOutLight from "@/assets/icons/videoCallOut-light.svg";
import VideoCallOutDark from "@/assets/icons/videoCallOut-dark.svg";
import VideoCallMissedLight from "@/assets/icons/videoCallMissed-light.svg";
import VideoCallMissedDark from "@/assets/icons/videoCallMissed-dark.svg";
import VideoCallInOnLight from "@/assets/icons/videoCallInOn-light.svg";
import VideoCallInOnDark from "@/assets/icons/videoCallInOn-dark.svg";
import VideoCallOutOnLight from "@/assets/icons/videoCallOutOn-light.svg";
import VideoCallOutOnDark from "@/assets/icons/videoCallOutOn-dark.svg";
import InfoIcon from "@/assets/icons/info.svg";
import { formatDate } from '@/utils/dateUtils';
import React, { useCallback, useContext, useMemo } from 'react';
import ThemedText from '@/components/ThemedText';
import { router } from 'expo-router';
import { Checkbox } from 'react-native-paper';
import { getCallDescription } from '@/utils/callsUtils';
import { VideoCallContext } from '@/contexts/VideoCallContext';

type CallType = 'incoming' | 'outgoing';
type CallStatus = 'completed' | 'missed' | 'rejected' | 'unanswered' | 'ongoing';

interface CallsCardProps {
    isEdit: boolean;
    label?: string;
    calls: Call[];
    onEditAction?: (id: number) => void;
    checkSelected: (id: number) => boolean; 
    style?: StyleProp<ViewStyle>;
}

export default function CallsCard({ isEdit, label, calls, onEditAction, checkSelected, style }: CallsCardProps) {
    const theme = useTheme();
    const scheme = useColorScheme();
    const videoCallContext = useContext(VideoCallContext);
    const iconComponents = useMemo(() => ({
        light: {
            missed: VideoCallMissedLight,
            incoming: VideoCallInLight,
            outgoing: VideoCallOutLight,
            ongoing: {
                incoming: VideoCallInOnLight,
                outgoing: VideoCallOutOnLight
            }
        },
        dark: {
            missed: VideoCallMissedDark,
            incoming: VideoCallInDark,
            outgoing: VideoCallOutDark,
            ongoing: {
                incoming: VideoCallInOnDark,
                outgoing: VideoCallOutOnDark
            }
        }
    }), []);

    const getIconComponent = useCallback((type: CallType, status: CallStatus) => {
        const colorScheme = scheme ?? 'light';

        if(status === 'missed') {
            return iconComponents[colorScheme].missed;
        } else if(status === 'ongoing') { 
            return iconComponents[colorScheme].ongoing[type];
        } else {
            return iconComponents[colorScheme][type];
        }
    }, [scheme]);

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
            <FlatList 
                data={calls}
                keyExtractor={call => call.id.toString()}
                renderItem={({ item: call }) => {
                    const contactFullName = call.contact?.lastName ? `${call.contact.firstName} ${call.contact.lastName ?? ""}` : call.contact?.firstName;
                    const userFullName = call.user ? call.user.firstName + " " + call.user.lastName : null;
                    const fullNameColor = call.status === "missed" ? theme.error : theme.primaryText;
                    const IconComponent = getIconComponent(call.type, call.status);
                    const onPress = isEdit && onEditAction && call.status !== 'ongoing' ? () => { onEditAction(call.id); } :
                        (call.contact?.user || call.user) && call.status !== 'ongoing' ? () => { 
                            if(call.contact?.user) {
                                videoCallContext?.startCall(call.contact.user.id, call.phone, call.contact.id);
                            } else if(call.user) {
                                videoCallContext?.startCall(call.user.id, call.phone);
                            }
                        } : undefined;

                    return (
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
                                        <IconComponent height={20} width={20} />
                                        <ThemedText
                                            color={theme.secondaryText}
                                            fontSize={12}
                                            fontWeight='medium'
                                            numberOfLines={1}
                                            style={styles.date}
                                        >
                                            {call.status !== 'ongoing' ? formatDate(call.date) : getCallDescription(call.type, call.status)}
                                        </ThemedText>
                                    </View>
                                </View>
                            }
                            trailingContent={
                                (isEdit && onEditAction ?
                                    <Checkbox
                                        status={checkSelected(call.id) ? 'checked' : 'unchecked'}
                                        onPress={() => onEditAction(call.id)}
                                        uncheckedColor={theme.divider}
                                        disabled={call.status === 'ongoing'}
                                        color={theme.accent}
                                    /> :
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
                                )
                            }
                            onPress={onPress}
                            style={styles.row}
                        />
                    );
                }}
                ItemSeparatorComponent={() => (
                    <Divider height={0.5} width="83%" style={styles.divider} />
                )}
                style={[styles.surface, { backgroundColor: theme.onSurface }]}
                contentContainerStyle={styles.surfaceContent}
            />        
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
        borderRadius: 15
    },
    surfaceContent: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start"
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