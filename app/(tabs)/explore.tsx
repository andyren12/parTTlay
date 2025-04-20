import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Props from "@/components/Props";

export default function Explore() {
  const { user, loading } = useAuth();

  if (loading) return null;
  const deposit = () => {
    router.push("/deposit");
  };

  return (
    <SafeAreaView style={styles.main}>
      <TouchableOpacity style={styles.balanceButton} onPress={deposit}>
        <Text>{(user?.balance ?? 0).toFixed(2)}+</Text>
      </TouchableOpacity>
      <GestureHandlerRootView style={styles.cards}>
        <Props />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceButton: {
    position: "absolute",
    right: 20,
    top: 80,
    backgroundColor: "gray",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 999,
  },
  cards: {
    width: "100%",
  },
});
