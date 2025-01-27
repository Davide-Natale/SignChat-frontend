import callsAPI from '@/api/callsAPI';
import usersAPI from '@/api/usersAPI';
import ImageProfile from '@/components/ImageProfile';
import ThemedButton from '@/components/ThemedButton';
import ThemedText from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Call } from '@/types/Call';
import { User } from '@/types/User';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AddUserIcon from '@/assets/icons/addUser.svg';
import VideoCallBoldIcon from '@/assets/icons/videoCall-bold.svg';
import VideoCallIcon from '@/assets/icons/videoCall.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';
import { formatDate } from '@/utils/dateUtils';
import { formatCallDuration, getCallDescription } from '@/utils/callsUtils';
import ListItem from '@/components/ListItem';
import { ErrorContext } from '@/contexts/ErrorContext';
import ThemedSnackBar from '@/components/ThemedSnackBar';

type CustomUser = Omit<User, 'email'> & { id: number };

export default function InfoUser() {
    const theme = useTheme();
    const router = useRouter();
    const errorContext = useContext(ErrorContext);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [user, setUser] = useState<CustomUser | null >(null);
    const [recentCalls, setRecentCalls] = useState<Call[]>([]);
    const fullName = user ? "~" + user?.firstName + " " + user?.lastName : "";

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                errorContext?.clearErrMsg();
                const user = await usersAPI?.getUser(parseInt(id));
                setUser(user);
            } catch (error) {
                errorContext?.handleError(error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchRecentCalls = async () => {
            if (user) {
                try {
                    errorContext?.clearErrMsg();
                    const recentCalls = await callsAPI.getCalls({
                        userId: user.id,
                        limit: 3
                    });

                    setRecentCalls(recentCalls);
                } catch (error) {
                    errorContext?.handleError(error);
                }
            }
        };

        fetchRecentCalls();
    }, [user]);

    return (
        <ScrollView
            contentContainerStyle={[styles.main, { backgroundColor: theme.surface }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.inner}>
                <ImageProfile
                    uri={user?.imageProfile ?? null}
                    size={140}
                    style={styles.image}
                />
                <ThemedText
                    color={theme.primaryText}
                    fontSize={28}
                    fontWeight="semibold"
                    numberOfLines={1}
                >
                    {user?.phone}
                </ThemedText>
                <ThemedText
                    color={theme.secondaryText}
                    fontSize={18}
                    fontWeight="regular"
                    numberOfLines={1}
                >
                    {fullName}
                </ThemedText>
                <ThemedButton
                    onPress={() => { /* TODO: add code to call contact */ }}
                    height={50}
                    width="70%"
                    backgroundColor={theme.accent}
                    style={styles.button}
                >
                    <View style={styles.buttonContent}>
                        <VideoCallIcon height={26} width={26} stroke={theme.onAccent} style={styles.buttonIcon} />
                        <ThemedText
                            color={theme.onAccent}
                            fontSize={16}
                            fontWeight="medium"
                        >
                            Video Call
                        </ThemedText>
                    </View>
                </ThemedButton>
                <ThemedText
                    color={theme.secondaryText}
                    fontSize={15}
                    fontWeight="medium"
                    style={styles.label}
                >
                    Recent Calls
                </ThemedText>
                <View style={[styles.surface1, 
                    { 
                        justifyContent: recentCalls.length > 0 ? "flex-start" : "center",
                        backgroundColor: theme.onSurface
                    }
                ]}>
                    { recentCalls.length > 0 ? 
                        recentCalls.map((call, index) => (
                            <View key={call.id} style={[styles.descriptionRow, 
                                {
                                    marginBottom: index < recentCalls.length - 1 ? 10 : undefined
                                }
                            ]}>
                                <ThemedText
                                    color={theme.secondaryText}
                                    fontSize={13}
                                    fontWeight="medium"
                                    numberOfLines={1}
                                    style={styles.date}
                                >
                                    {formatDate(call.date)}
                                </ThemedText>
                                <View style={styles.descriptionContainer} >
                                    <View style={styles.description} >
                                        <VideoCallBoldIcon height={20} width={20} fill={theme.secondaryText} style={styles.descriptionIcon} />
                                        <ThemedText
                                            color={theme.primaryText}
                                            fontSize={13}
                                            fontWeight="medium"
                                            numberOfLines={1}
                                        >
                                            {getCallDescription(call.type, call.status)}
                                        </ThemedText>
                                    </View>
                                    {call.duration > 0 ?
                                        <ThemedText
                                            color={theme.secondaryText}
                                            fontSize={13}
                                            fontWeight="medium"
                                            numberOfLines={1}
                                        >
                                            {formatCallDuration(call.duration)}
                                        </ThemedText> : null
                                    }
                                </View>
                            </View>
                        )) :
                        <ThemedText
                            color={theme.secondaryText}
                            fontSize={16}
                            fontWeight="medium"
                            numberOfLines={1}
                            style={styles.message}
                        >
                            No recent calls
                        </ThemedText>
                    }
                </View>
                <View style={[styles.surface2, { backgroundColor: theme.onSurface }]} >
                    <ListItem
                        onPress={() => router.push({ pathname: "/contacts/add", params: { userPhone: user?.phone } })}
                        leadingContent={<AddUserIcon stroke={theme.secondaryText} style={styles.icon} />}
                        headlineContent={
                            <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                                Add Contact
                            </ThemedText>
                        }
                        trailingContent={<ArrowRightIcon stroke={theme.secondaryText} />}
                        style={styles.row}
                    />
                </View>
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
    image: {
        marginTop: 15,
        marginBottom: 5
    },
    button: {
        marginTop: 15,
        marginBottom: 25,
    },
    buttonContent: {
        flexDirection: "row", 
        justifyContent: "center", 
        alignItems: "center"
    },
    buttonIcon: {
        marginRight: 10
    },
    label: {
        marginHorizontal: 8,
        marginBottom: 5,
        alignSelf: "flex-start"
    },
    surface1: {
        width: "100%",
        minHeight: 120,
        alignItems: "flex-start",
        borderRadius: 20,
        marginBottom: 30,
        paddingVertical: 15,
        paddingHorizontal: "5%"
    },
    descriptionRow: {
        flexDirection: "row", 
        justifyContent: "flex-start", 
        alignItems: "flex-start"
    },
    date: {
        flex: 1
    },
    descriptionContainer: {
        flex: 2
    },
    description: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    descriptionIcon: {
        marginRight: 8
    },
    message: {
        alignSelf: "center"
    },
    surface2: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderRadius: 15,
        marginBottom: 30
    },
    row: {
        marginVertical: 12,
        paddingHorizontal: "5%"
    },
    icon: {
        marginRight: 15
    }
});