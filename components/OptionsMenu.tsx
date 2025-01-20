import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Menu } from 'react-native-paper';
import OptionsIcon from "@/assets/icons/options.svg";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Option {
    title: string;
    trailingIcon: React.ReactNode;
    onPress: () => void;
    color: string;
}

interface OptionsMenuProps {
    options: Option[];
}

export default function OptionsMenu({ options }: OptionsMenuProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
                <TouchableOpacity
                    onPress={openMenu}
                    touchSoundDisabled
                    activeOpacity={0.8}
                >
                    <OptionsIcon height={30} width={30} stroke={theme.primaryText} style={styles.icon} />
                </TouchableOpacity>
            }
            anchorPosition="bottom"
            statusBarHeight={insets.top + 8}
            elevation={1}
            contentStyle={[styles.menu, { backgroundColor: theme.onSurface }]}
        >
            { options.map(option => 
                    <Menu.Item 
                        title={option.title} 
                        trailingIcon={() => option.trailingIcon} 
                        onPress={option.onPress}
                        titleStyle={[styles.title, { color: option.color }]} 
                    />
                )
            }
        </Menu>
    );
}

const styles = StyleSheet.create({
    menu: {
        right: 5
    },
    icon: {
        marginRight: 15
    },
    title: {
        fontFamily: 'inter_regular',
        fontSize: 15
    }
});