import callsAPI from '@/api/callsAPI';
import ImageProfile from '@/components/ImageProfile';
import ListItem from '@/components/ListItem';
import ThemedText from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Call } from '@/types/Call';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useContext, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import VideoCallIcon from '@/assets/icons/videoCall.svg';
import VideoCallInLight from "@/assets/icons/videoCallIn-light.svg";
import VideoCallInDark from "@/assets/icons/videoCallIn-dark.svg";
import VideoCallOutLight from "@/assets/icons/videoCallOut-light.svg";
import VideoCallOutDark from "@/assets/icons/videoCallOut-dark.svg";
import VideoCallMissedLight from "@/assets/icons/videoCallMissed-light.svg";
import VideoCallMissedDark from "@/assets/icons/videoCallMissed-dark.svg";
import TrashIcon from '@/assets/icons/trash.svg';
import { formatDate } from '@/utils/dateUtils';
import { formatCallDuration, getCallDescription } from '@/utils/callsUtils';
import AlertDialog from '@/components/AlertDialog';
import { AppContext } from '@/contexts/AppContext';
import { ErrorContext } from '@/contexts/ErrorContext';
import ThemedSnackBar from '@/components/ThemedSnackBar';
import OptionsMenu from '@/components/OptionsMenu';

export default function InfoCall() {
    const theme = useTheme();
    const scheme = useColorScheme();
    const router = useRouter();
    const navigation = useNavigation();
    const appContext = useContext(AppContext);
    const errorContext = useContext(ErrorContext);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [call, setCall] = useState<Call>();
    const [visible, setVisible] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const contactFullName = call?.contact?.lastName ? `${call.contact.firstName} ${call.contact.lastName ?? ""}` :
        call?.contact?.firstName;

    const userFullName = call?.user ? call.user.firstName + " " + call.user.lastName : null;

    const onPress = call?.contact || call?.user ? () => {
        if(call?.contact) {
            router.push({ pathname: '/contacts/[id]/info', params: { id: call.contact.id } });
        } else if(call.user) {
            router.push({ pathname: '/users/[id]', params: { id: call.user.id } });
        }
    } : undefined;

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

    const IconComponent = call ? 
        iconComponents[scheme ?? 'light'][call.status === "missed" ? "missed" : call.type] : null;

    const openMenu = useCallback(() => setVisible(true), []);
    
    const closeMenu = useCallback(() => setVisible(false),[]);

    useFocusEffect(
        useCallback(() => {
            const fetchCall = async () => {
                try {
                    const call = await callsAPI.getCall(parseInt(id));
                    setCall(call);
                } catch (error) {
                    //  No need to do anything
                }
            };
    
            fetchCall();
        }, [])
    );

    useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => 
            <OptionsMenu
                visible={visible}
                openMenu={openMenu}
                closeMenu={closeMenu}
                options={
                    [
                        {
                            title: 'Remove',
                            color: theme.error,
                            trailingIcon: <TrashIcon height={22} width={22} stroke={theme.error} />,
                            onPress: () => { closeMenu(); setShowDialog(true) }
                        }
                    ]}
                topOffset={42}
                rightOffset={-1}
            />
        });
      }, [visible]);

    return (
        <ScrollView
            contentContainerStyle={[styles.main, { backgroundColor: theme.surface }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.inner}>
                <View style={[styles.surface1, { backgroundColor: theme.onSurface }]} >
                    <ListItem
                        leadingContent={
                            <ImageProfile
                                uri={call?.contact?.user ? call.contact.user.imageProfile : call?.user ? call.user.imageProfile : null}
                                size={52}
                                style={styles.image}
                            />
                        }
                        headlineContent={
                            <View>
                                <ThemedText color={theme.primaryText} fontSize={18} fontWeight="medium" numberOfLines={1} >
                                    {contactFullName ?? call?.phone}
                                </ThemedText>
                                {userFullName ?
                                    <ThemedText color={theme.primaryText} fontSize={14} fontWeight='medium' numberOfLines={1}>
                                        {"~" + userFullName}
                                    </ThemedText> : null
                                }
                            </View>
                        }
                        trailingContent={
                            ( call?.contact?.user || call?.user ?
                                <TouchableOpacity
                                    onPress={() => { /* TODO: add code to call user */ }}
                                    touchSoundDisabled
                                    activeOpacity={0.8}
                                >
                                    <VideoCallIcon
                                        height={28}
                                        width={28}
                                        stroke={theme.primaryText}
                                        style={styles.infoIcon}
                                    />
                                </TouchableOpacity> : undefined
                            )
                        }
                        onPress={onPress}
                        style={styles.row}
                    />
                </View>
                <View style={[styles.surface2, { backgroundColor: theme.onSurface }]} >
                    <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center" } }>
                            { IconComponent ? <IconComponent height={26} width={26} style={{ marginRight: 7 }} /> : null }
                            <ThemedText 
                                color={theme.primaryText} 
                                fontSize={16} 
                                fontWeight="medium" 
                                numberOfLines={1}
                            >   
                                { call ? getCallDescription(call?.type, call?.status) : "" }
                            </ThemedText>
                        </View>
                        <ThemedText
                            color={theme.primaryText}
                            fontSize={13}
                            fontWeight="medium"
                            numberOfLines={1}
                        >
                            {call ? formatDate(call.date, "D MMM YYYY", false) : ""}
                        </ThemedText>
                    </View>
                    <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 25 }}>
                        {call ?
                            <ThemedText
                                color={theme.secondaryText}
                                fontSize={12}
                                fontWeight="medium"
                                numberOfLines={1}
                            >
                                {formatCallDuration(call.duration)}
                            </ThemedText> : null
                        }
                        <ThemedText 
                            color={theme.secondaryText} 
                            fontSize={12} 
                            fontWeight="medium" 
                            numberOfLines={1}
                        >
                            { call?.date.format("HH:mm") }
                        </ThemedText>
                    </View>
                </View>
                <AlertDialog
                    showDialog={showDialog}
                    title='Remove Call'
                    content='Are you sure to remove call from your call history?'
                    confirmText='Remove'
                    onConfirm={async () => {
                        try {
                            errorContext?.clearErrMsg();
                            appContext?.updateLoading(true);
                            if(call) {
                                await callsAPI.deleteCalls([call?.id]);
                            }
                            router.back();
                        } catch (error) {
                            errorContext?.handleError(error);
                        } finally {
                            appContext?.updateLoading(false);
                            setShowDialog(false);
                        }
                    }}
                    onDismiss={() => setShowDialog(false)}
                />
                <ThemedSnackBar />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    main: {
        flexGrow: 1,
        justifyContent: "flex-start",
        alignItems: "center"
    },
    inner: {
        flex: 1,
        width: "90%",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    surface1: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderRadius: 15,
        marginVertical: 15
    },
    surface2: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderRadius: 15,
        marginVertical: 15,
        paddingVertical: 8,
        paddingHorizontal: "3.5%"
    },
    row: {
        marginVertical: 8,
        paddingHorizontal: "3.5%",
    },
    image: {
        marginRight: 15
    },
    infoIcon: {
        marginRight: 5
    },
});