import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";

export default function Explore() {
  const { user, loading } = useAuth();

  if (loading) return null;
  const deposit = () => {
    router.push("/deposit");
  };
  console.log(user?.balance);
  return (
    <SafeAreaView style={styles.main}>
      <TouchableOpacity style={styles.balanceButton} onPress={deposit}>
        <Text>{(user?.balance ?? 0).toFixed(2)}+</Text>
      </TouchableOpacity>
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
  },
});
