import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ImageProfile from '@/components/ImageProfile';
import ThemedText from '@/components/ThemedText';
import ThemedButton from '@/components/ThemedButton';
import ListItem from '@/components/ListItem';
import Divider from '@/components/Divider';
import PhoneIcon from '@/assets/icons/call.svg';
import EmailIcon from '@/assets/icons/email.svg';
import NotificationIcon from '@/assets/icons/notification.svg';
import AccessibilityIcon from '@/assets/icons/accessibility.svg';
import EditIcon from '@/assets/icons/edit.svg';
import TrashIcon from '@/assets/icons/trash.svg';
import LockIcon from '@/assets/icons/lock.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';
import { Switch } from 'react-native-gesture-handler';
import AlertDialog from '@/components/AlertDialog';
import { AppContext } from '@/contexts/AppContext';
import ThemedSnackBar from '@/components/ThemedSnackBar';

export default function Profile() {
  const theme = useTheme();
  const [showDialog, setShowDialog] = useState(false);
  const authContext = useContext(AuthContext);
  const appContext = useContext(AppContext);
  const fullName = authContext?.user ? authContext?.user.firstName + " " + authContext?.user.lastName : "";

  useFocusEffect(useCallback(() => { authContext?.fetchProfile(); }, []));

  return (
    <ScrollView
      contentContainerStyle={[styles.main, { backgroundColor: theme.surface }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        <ImageProfile 
          uri={authContext?.user?.imageProfile ?? null} 
          size={140} 
          style={styles.image} 
        />
        <ThemedText 
          color={theme.primaryText} 
          fontSize={28} 
          fontWeight="semibold"
          numberOfLines={1} 
        >
          {fullName}
        </ThemedText>
        <ThemedButton
          onPress={() => router.push("/profile/edit")}
          height={50}
          width="70%"
          backgroundColor={theme.accent}
          style={styles.button}
        >
          <View style={styles.buttonContent} >
            <EditIcon height={26} width={26} stroke={theme.onAccent} style={styles.buttonIcon} />
            <ThemedText color={theme.onAccent} fontSize={16} fontWeight="medium" >Edit Profile</ThemedText>
          </View>
        </ThemedButton>
        <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.label}>
          Info
        </ThemedText>
        <View style={[styles.surface, { backgroundColor: theme.onSurface }]} >
          <ListItem
            leadingContent={<EmailIcon stroke={theme.secondaryText} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                {authContext?.user? authContext?.user.email : ""}
              </ThemedText>
            }
            style={styles.row}
          />
          <Divider height={0.5} width="85%" style={styles.divider} />
          <ListItem
            leadingContent={<PhoneIcon stroke={theme.secondaryText} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                {authContext?.user? authContext?.user.phone : ""}
              </ThemedText>
            }
            style={styles.row}
          />
        </View>
        <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.label}>
          Preferences
        </ThemedText>
        <View style={[styles.surface, { backgroundColor: theme.onSurface }]} >
          <ListItem
            leadingContent={<NotificationIcon stroke={theme.secondaryText} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                Push Notifications
              </ThemedText>
            }
            trailingContent={
              <Switch 
                value={appContext?.isNotificationsEnabled ?? false} 
                onValueChange={appContext?.updateNotifications}
                thumbColor={theme.onAccent}
                trackColor={{false: theme.divider, true: theme.confirm}}
                style={styles.switch} 
              />
            }
            style={styles.row}
          />
          <Divider height={0.5} width="85%" style={styles.divider} />
          <ListItem
            leadingContent={<AccessibilityIcon stroke={theme.secondaryText} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                Accessibility Features
              </ThemedText>
            }
            trailingContent={
              <Switch
                value={appContext?.isAccessibilityEnabled ?? false} 
                onValueChange={appContext?.updateAccessibility}
                thumbColor={theme.onAccent}
                trackColor={{false: theme.divider, true: theme.confirm}}
                style={styles.switch}
              />
            }
            style={styles.row}
          />
        </View>
        <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.label}>
          Settings
        </ThemedText>
        <View style={[styles.surface, { backgroundColor: theme.onSurface }]} >
          <ListItem
            onPress={() => router.push("/profile/change-password")}
            leadingContent={<LockIcon stroke={theme.secondaryText} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                Change Password
              </ThemedText>
            }
            trailingContent={<ArrowRightIcon stroke={theme.secondaryText} />}
            style={styles.row}
          />
          <Divider height={0.5} width="85%" style={styles.divider} />
          <ListItem
            onPress={() => setShowDialog(true)}
            leadingContent={<TrashIcon stroke={theme.error} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.error} fontSize={16} fontWeight="regular" numberOfLines={1} >
                Delete Account
              </ThemedText>
            }
            style={styles.row}
          />
          <Divider height={0.5} width="85%" style={styles.divider} />
          <ListItem
            onPress={async () => {
              try {
                await authContext?.logout();
              } catch (error) {
                //  No need to do anything
              } finally {
                router.replace("/"); 
                router.push("/login");
              }
            }}
            leadingContent={<LogoutIcon stroke={theme.error} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.error} fontSize={16} fontWeight="regular" numberOfLines={1} >
                Logout
              </ThemedText>
            }
            style={styles.row}
          />
        </View>
        <AlertDialog 
          showDialog={showDialog}
          title='Delete Account'
          content='Are you sure to delete your account?'
          confirmText='Delete'
          onConfirm={async () => { 
            setShowDialog(false); 
            try {
              await authContext?.deleteAccount();
            } catch (error) {
              //  No need to do anything
            } finally {
              router.replace("/"); 
              router.push("/login");
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
  image: {
    marginTop: 15,
    marginBottom: 5
  },
  button: {
    marginTop: 15,
    marginBottom: 20,
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
  surface: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderRadius: 20, 
    marginBottom: 30
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
  },
  divider: {
    alignSelf: "flex-end" 
  }
});