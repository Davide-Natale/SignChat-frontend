import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Menu } from 'react-native-paper';
import OptionsIcon from "@/assets/icons/options.svg";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Divider from './Divider';

interface Option {
    title: string;
    color: string;
    trailingIcon: React.ReactNode;
    onPress: () => void;
}

interface OptionsMenuProps {
    visible: boolean,
    openMenu: () => void,
    closeMenu: () => void,
    options: Option[];
    topOffset?: number;
    rightOffset?: number
    style?: StyleProp<ViewStyle>;
}

export default function OptionsMenu({ visible, openMenu, closeMenu, options, topOffset, rightOffset, style }: OptionsMenuProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
                <TouchableOpacity
                    onPress={openMenu}
                    touchSoundDisabled
                    activeOpacity={0.8}
                    style={style}
                >
                    <OptionsIcon height={30} width={30} stroke={theme.accent} />
                </TouchableOpacity>
            }
            anchorPosition="bottom"
            statusBarHeight={insets.top + (topOffset ?? 8)}
            elevation={1}
            contentStyle={[styles.menu, { right: rightOffset ?? 8, backgroundColor: theme.onSurface }]}
        >
            { options.map((option, index) => 
                    <React.Fragment key={index} >
                        <Menu.Item 
                            title={option.title} 
                            trailingIcon={() => option.trailingIcon} 
                            onPress={option.onPress}
                            titleStyle={[styles.title, { color: option.color }]} 
                        />
                        { index < options.length - 1 ?
                            <Divider 
                                height={0.5} 
                                width="100%"
                            /> : null
                        }
                    </React.Fragment> 
                )
            }
        </Menu>
    );
}

const styles = StyleSheet.create({
    menu: {
        borderRadius: 15
    },
    title: {
        fontFamily: 'inter_regular',
        fontSize: 16
    }
});