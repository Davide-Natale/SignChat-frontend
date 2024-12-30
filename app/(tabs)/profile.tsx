import { AuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import profileAPI, { User } from '@/api/profileAPI';
import { isAxiosError } from 'axios';
import ImageProfile from '@/components/ImageProfile';
import ThemedText from '@/components/ThemedText';
import ThemedButton from '@/components/ThemedButton';
import ListItem from '@/components/ListItem';
import Divider from '@/components/Divider';
import PhoneIcon from '@/assets/icons/call.svg';
import EmailIcon from '@/assets/icons/email.svg';
import NotificationIcon from '@/assets/icons/notification.svg';
import AccessibilityIcon from '@/assets/icons/accessibility.svg';
import TrashIcon from '@/assets/icons/trash.svg';
import LockIcon from '@/assets/icons/lock.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';
import { Switch } from 'react-native-gesture-handler';
import AlertDialog from '@/components/AlertDialog';

export default function Profile() {
  const theme = useTheme();
  const [user, setUser] = useState<User>();
  const [showDialog, setShowDialog] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const authContext = useContext(AuthContext);
  const fullName = user ? user.firstName + " " + user.lastName : "";

  useEffect(() => {
    profileAPI.getProfile()
      .then(user => { setUser(user); })
      .catch(err => { if (isAxiosError(err)) console.log(err.response?.data.message); })
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[styles.main, { backgroundColor: theme.surface }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        {/* TODO: change with real imageProfile variable*/}
        <ImageProfile uri={null } size={140} style={styles.image} />
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
          height={40}
          width="60%"
          shape='circular'
          backgroundColor={theme.accent}
          style={styles.button}
        >
          <ThemedText color={theme.onAccent} fontSize={15} fontWeight="bold" >Edit Profile</ThemedText>
        </ThemedButton>
        <ThemedText color={theme.secondaryText} fontSize={15} fontWeight="medium" style={styles.label}>
          Info
        </ThemedText>
        <View style={[styles.surface, { backgroundColor: theme.onSurface }]} >
          <ListItem
            leadingContent={<EmailIcon stroke={theme.secondaryText} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                {user? user.email : ""}
              </ThemedText>
            }
            style={styles.row}
          />
          <Divider height={0.5} width="85%" style={styles.divider} />
          <ListItem
            leadingContent={<PhoneIcon stroke={theme.secondaryText} style={styles.icon} />}
            headlineContent={
              <ThemedText color={theme.secondaryText} fontSize={16} fontWeight="regular" numberOfLines={1} >
                {user? user.phone : ""}
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
                //  TODO: handle correctly this value
                value={isEnabled} 
                onValueChange={value => setIsEnabled(value)}
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
                //  TODO: handle correctly this value
                value={true} 
                //onValueChange={}
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
                if(isAxiosError(error)) {
                  //  Handle error
                  console.log(error.response?.data.message);
                }
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
          onConfirm={() => { setShowDialog(false) /*TODO: add call delete profile api */}}
          onDismiss={() => setShowDialog(false)}
        />
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
    marginTop: 10,
    marginBottom: 20,
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