import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import CompletedBetsCard from "./CompletedBetsCard";

export default function CompletedBets() {
  const { user, loading } = useAuth();
  const [completedBets, setCompletedBets] = useState([]);

  useEffect(() => {
    const fetchCompletedBets = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      setCompletedBets(userData?.completedWagers || []);
    };

    fetchCompletedBets();
  }, [user, loading]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView>
        {completedBets.map((bet, index) => (
          <CompletedBetsCard key={index} bet={bet} />
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: "100%",
    width: "100%",
  },
});
