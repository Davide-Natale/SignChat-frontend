import ImageProfile from '@/components/ImageProfile';
import ThemedTextInput from '@/components/ThemedTextInput';
import { AppContext } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { useNavigation } from 'expo-router';
import { useRouter } from 'expo-router';
import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import UserIcon from "@/assets/icons/user-bold.svg";
import EmailIcon from "@/assets/icons/email-bold.svg";
import PhoneIcon from "@/assets/icons/call-bold.svg";
import ThemedSaveButton from '@/components/ThemedSaveButton';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import Divider from '@/components/Divider';
import ThemedText from '@/components/ThemedText';
import CameraIcon from '@/assets/icons/camera.svg';
import GalleryIcon from '@/assets/icons/gallery.svg';
import TrashIcon from '@/assets/icons/trash.svg';
import ListItem from '@/components/ListItem';
import React from 'react';

export default function CompleteProfile() {
    const theme = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const appContext = useContext(AppContext);
    const [imageProfile, setImageProfile] = useState<string | null>(null);
    const [firstName, setFirstName] = useState("Davide");
    const [lastName, setLastName] = useState("Natale");
    const [email, setEmail] = useState("daxnatale@gmail.com");
    const [phoneNumber, setPhoneNumber] = useState("3457604304");
    const [firstErrMsg, setFirstErrMsg] = useState("");
    const [lastErrMsg, setLastErrMsg] = useState("");
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const [phoneErrMsg, setPhoneErrMsg] = useState("");
    const textInputRef1 = useRef<TextInput>(null);
    const textInputRef2 = useRef<TextInput>(null);
    const textInputRef3 = useRef<TextInput>(null);
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const pickImage = async () => {
        bottomSheetRef.current?.dismiss();

        try {
            //  Request Permissions
            await ImagePicker.requestMediaLibraryPermissionsAsync();

            //  Launch Gallery 
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1
            });

            //  Update Image Profile
            if (!result.canceled) {
                setImageProfile(result.assets[0].uri)
            }
        } catch (error) {
            //  Handle error
            console.log(error);
        }
    };

    const takePhoto = async () => {
        bottomSheetRef.current?.dismiss();

        try {
            //  Request Permissions
            await ImagePicker.requestCameraPermissionsAsync();

            //  Launch Camera 
            const result = await ImagePicker.launchCameraAsync({
                cameraType: ImagePicker.CameraType.front,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1
            });

            //  Update Image Profile
            if (!result.canceled) {
                setImageProfile(result.assets[0].uri)
            }
        } catch (error) {
            //  Handle error
            console.log(error);
        }
    };

    const checkFirstName = () => { /* TODO: implement it */ }

    const checkLastName = () => { /* TODO: implement it */ }

    const checkEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@\.]{2,}$/;

        if (email === "") {
            setEmailErrMsg("Email is a required field.");
            return false;
        }

        if (!emailRegex.test(email)) {
            setEmailErrMsg("Insert a valid email.");
            return false;
        }

        setEmailErrMsg("");
        return true;
    };

    const checkPhoneNumber = () => { /* TODO: implement it */ }

    const handleSubmit = async () => { /* TODO: implement it */ }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <ThemedSaveButton onPress={handleSubmit} />
        });
    }, []);

    return (
        <ScrollView
            contentContainerStyle={[styles.main, { backgroundColor: theme.primary }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.inner}>
                <ImageProfile 
                    uri={imageProfile}  
                    size={140} 
                    showEdit
                    onEditPress={() => bottomSheetRef.current?.present()} 
                    style={styles.image}
                />
                <ThemedTextInput
                    value={firstName}
                    onChangeText={f => setFirstName(f)}
                    clearValue={() => setFirstName("")}
                    errMsg={firstErrMsg}
                    placeholder='First Name'
                    leadingIcon={<UserIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='words'
                    keyboardType='default'
                    returnKeyType='next'
                    onSubmitEditing={() => textInputRef1.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef1}
                    value={lastName}
                    onChangeText={l => setLastName(l)}
                    clearValue={() => setLastName("")}
                    errMsg={lastErrMsg}
                    placeholder='Last Name'
                    leadingIcon={<UserIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='words'
                    keyboardType='default'
                    returnKeyType='next'
                    onSubmitEditing={() => textInputRef2.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef2}
                    value={email}
                    onChangeText={e => setEmail(e)}
                    clearValue={() => setEmail("")}
                    errMsg={emailErrMsg}
                    placeholder='Email'
                    leadingIcon={<EmailIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='email-address'
                    returnKeyType="next"
                    onSubmitEditing={() => textInputRef3.current?.focus()}
                />
                <ThemedTextInput
                    externalRef={textInputRef3}
                    value={phoneNumber}
                    onChangeText={p => setPhoneNumber(p)}
                    clearValue={() => setPhoneNumber("")}
                    errMsg={phoneErrMsg}
                    placeholder='Phone Number'
                    leadingIcon={<PhoneIcon fill={theme.primaryText} />}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='numeric'
                    returnKeyType='done'
                    onSubmitEditing={handleSubmit}
                />
                <BottomSheetModal
                    ref={bottomSheetRef}
                    enablePanDownToClose
                    backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
                    backgroundStyle={{backgroundColor: theme.surface}}
                    handleIndicatorStyle={{backgroundColor: theme.primaryText}}
                >
                    <BottomSheetView style={styles.contentContainer}>
                        <ThemedText color={theme.primaryText} fontSize={18} fontWeight="medium" style={styles.title}>
                            Modify profile image
                        </ThemedText>
                        <View style={[styles.surface, { backgroundColor: theme.onSurface}]} >
                            <ListItem 
                                onPress={takePhoto}
                                headlineContent={
                                    <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" >
                                        Take a photo
                                    </ThemedText>
                                }
                                trailingContent={<CameraIcon stroke={theme.secondaryText}/>}
                                style={styles.row}
                            />
                            <Divider height={0.5} width="95%" style={styles.divider}/>
                            <ListItem 
                                onPress={pickImage}
                                headlineContent={
                                    <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" >
                                        Choose a photo
                                    </ThemedText>
                                }
                                trailingContent={<GalleryIcon stroke={theme.secondaryText}/>}
                                style={styles.row}
                            />
                            {imageProfile ?
                                <>
                                    <Divider height={0.5} width="95%" style={styles.divider}/>
                                    <ListItem 
                                        onPress={() => { setImageProfile(null) ; bottomSheetRef.current?.dismiss() }}
                                        headlineContent={
                                            <ThemedText color={theme.error} fontSize={16} fontWeight="regular" >
                                                Remove photo
                                            </ThemedText>
                                        }
                                        trailingContent={<TrashIcon stroke={theme.error}/>}
                                        style={styles.row}
                                    />
                                </>
                                 : null
                            }
                        </View>
                    </BottomSheetView>
                </BottomSheetModal>
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
        marginBottom: 25
    },
    contentContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: 'center'
    },
    title: {
        marginTop: 5,
        marginBottom: 20
    },
    surface: {
        width: "90%",
        justifyContent: "flex-start",
        alignItems: "center",
        borderRadius: 20, 
        marginBottom: 35
    },
    row: {
        marginVertical: 15,
        paddingHorizontal: "5%"
    },
    divider: {
        alignSelf: "flex-end" 
    }
});