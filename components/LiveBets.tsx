import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import LiveBetsCard from "./LiveBetsCard";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

type liveBet = {
  amount: number;
  lineId: string;
  propId: string;
  wagerId: string;
  type: "simple" | "firstToComplete";
  over?: boolean;
  participant?: string;
};

export default function LiveBets() {
  const { user, loading } = useAuth();
  const [liveBets, setLiveBets] = useState<liveBet[]>([]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    const fetchCurrentBets = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const currentWagers = userData.currentWagers || [];
      setLiveBets(currentWagers);
    };

    fetchCurrentBets();
  }, [loading, user]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView>
        {liveBets.map((bet, index) => (
          <LiveBetsCard key={index} bet={bet} />
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 16,
    paddingBottom: 160,
  },
});
