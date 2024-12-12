import { Text, View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function Index() {
  let theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.primary
      }}
    >
      <Text style={[ styles.interBlack, { fontSize: 15, color: theme.primaryText }]}>Example text for font family</Text>
      <Text style={[ styles.interExtraBold, { fontSize: 15, color: theme.secondaryText }]}>Example text for font family</Text>
      <Text style={[ styles.interBold, { fontSize: 15, color: theme.accent }]}>Example text for font family</Text>
      <Text style={[ styles.interSemiBold, { fontSize: 15, color: theme.error }]}>Example text for font family</Text>
      <Text style={[ styles.interMedium, { fontSize: 15, color: theme.confirm }]}>Example text for font family</Text>
      <Text style={[ styles.interRegular, { fontSize: 15, color: theme.divider }]}>Example text for font family</Text>
      <Text style={[ styles.interLight, { fontSize: 15, color: theme.secondary }]}>Example text for font family</Text>
      <Text style={[ styles.interExtraLight, { fontSize: 15 }]}>Example text for font family</Text>
      <Text style={[ styles.interThin, { fontSize: 15 }]}>Example text for font family</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  interBlack: {
    fontFamily: "inter_black"
  },
  interExtraBold: {
    fontFamily: "inter_extrabold",
    color: "blue"
  },
  interBold: {
    fontFamily: "inter_bold",
    color: "blue"
  },
  interSemiBold: {
    fontFamily: "inter_semibold",
    color: "blue"
  },
  interMedium: {
    fontFamily: "inter_medium",
    color: "blue"
  },
  interRegular: {
    fontFamily: "inter_regular",
    color: "blue"
  },
  interLight: {
    fontFamily: "inter_light",
    color: "blue"
  },
  interExtraLight: {
    fontFamily: "inter_extralight",
    color: "blue"
  },
  interThin: {
    fontFamily: "inter_thin",
    color: "blue"
  },
});