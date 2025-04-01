import { useTheme } from '@/hooks/useTheme';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import ListItem from './ListItem';
import ThemedText from './ThemedText';
import { AppContext } from '@/contexts/AppContext';
import AccessibilityIcon from '@/assets/icons/accessibility.svg';
import { Switch } from 'react-native-gesture-handler';
import SignalIndicator from './SignalIndicator';
import { VideoCallContext } from '@/contexts/VideoCallContext';

type Ref = BottomSheetModal;

interface VideoCallBottomSheetProps {
    onDismiss: () => void;
}

const VideoCallBottomSheet = forwardRef<Ref, VideoCallBottomSheetProps>(({ onDismiss }, ref) => {
    const darkTheme = useTheme('dark');
    const appContext = useContext(AppContext);
    const videoCallContext = useContext(VideoCallContext);

    return (
        <BottomSheetModal
            ref={ref}
            enablePanDownToClose
            backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
            backgroundStyle={{ backgroundColor: darkTheme.surface }}
            handleIndicatorStyle={{ backgroundColor: darkTheme.primaryText }}
            onDismiss={onDismiss}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.inner} >
                    <SignalIndicator height={20} connectionQuality={videoCallContext?.connectionQuality} style={styles.signal} />
                    <ThemedText color={darkTheme.secondaryText} fontSize={18} fontWeight="medium" >
                        {`${videoCallContext?.connectionQuality ?? 'Checking'} connection${!videoCallContext?.connectionQuality ? '...' : ''}`}
                    </ThemedText>
                </View>
                <View style={[styles.surface, { backgroundColor: darkTheme.onSurface }]} >
                    <ListItem
                        leadingContent={<AccessibilityIcon stroke={darkTheme.primaryText} style={styles.icon} />}
                        headlineContent={
                            <ThemedText color={darkTheme.primaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                                Accessibility Features
                            </ThemedText>
                        }
                        trailingContent={
                            <Switch
                                value={appContext?.isAccessibilityEnabled ?? false}
                                onValueChange={appContext?.updateAccessibility}
                                thumbColor={darkTheme.onAccent}
                                trackColor={{ false: darkTheme.divider, true: darkTheme.confirm }}
                                style={styles.switch}
                            />
                        }
                        style={styles.row}
                    />
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default VideoCallBottomSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inner: {
        width: "90%",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 20
    },
    signal: {
        marginRight: 8
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
    icon: {
        marginRight: 15
    },
    switch: {
        left: 8
    }
});