import { TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BackButton() {
  return (
    <TouchableOpacity style={styles.button} onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={28} color="#007AFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 60,
    left: 10,
    padding: 10,
    zIndex: 999,
  },
});
