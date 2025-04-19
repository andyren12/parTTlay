import BackButton from "@/components/BackButton";
import { auth, db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

export default function deposit() {
  const { user } = useAuth();

  const [value, setValue] = useState("10");

  const handleChange = (text: string) => {
    const numeric = text.replace(/[^0-9.]/g, "");
    setValue(numeric);
  };

  const addBalance = async () => {
    const userId = auth.currentUser?.uid;
    const newBalance = parseInt(user?.balance ?? 0) + parseInt(value);

    try {
      if (userId) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          balance: newBalance,
        });

        setValue("");
        router.back();
      }
    } catch (err) {
      console.error("Failed to add balance:", err);
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <BackButton />
      <Text>Balance: {(user?.balance ?? 0).toFixed(2)}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.dollarSign}>$</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
        />
      </View>
      <TouchableOpacity style={styles.addButton} onPress={addBalance}>
        <Text>Add</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 120,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 140,
  },
  dollarSign: {
    fontSize: 18,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    textAlign: "center",
    padding: 0,
  },
  addButton: {
    backgroundColor: "gray",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
