import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import { Image } from "react-native";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type completedBet = {
  amount: number;
  completedAt: Date;
  name: string;
  line: string;
  propId: string;
  over: boolean;
  title: string;
  payout: number;
  result: string;
  userId: string;
  wagerId: string;
};

export default function CompletedBetsCard({ bet }: { bet: completedBet }) {
  const [name, setName] = useState("");
  const [picture, setPicture] = useState("");

  useEffect(() => {
    const fetchProp = async () => {
      const propRef = doc(db, "props", bet.propId);
      const propSnap = await getDoc(propRef);
      const propData = propSnap.data();
      setName(propData?.name || "");
      setPicture(propData?.picture || "");
    };

    fetchProp();
  }, [bet.propId]);

  return (
    <View style={styles.card}>
      <View style={styles.title}>
        <Image
          source={{ uri: picture }}
          style={styles.profileImage}
          resizeMode="contain"
        />
        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.description1}>{bet.title}</Text>
        <View style={styles.line}>
          <Text style={styles.description1}>{bet.line}</Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <View style={{ alignItems: "center" }}>
          <Text>Entry</Text>
          <Text>${bet.amount}</Text>
        </View>
        {bet.result === "win" ? (
          <View style={{ flexDirection: "row" }}>
            <Text>Won</Text>
            <Ionicons name="checkmark-circle" size={18} color="green" />
          </View>
        ) : (
          <View style={{ flexDirection: "row" }}>
            <Text>Lost</Text>
            <Ionicons name="close-circle" size={18} color="red" />
          </View>
        )}
        <View style={{ alignItems: "center" }}>
          <Text>Payout</Text>
          <Text>${bet.payout}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 0.5,
    marginBottom: 20,
  },
  title: {
    flexDirection: "row",
    padding: 12,
  },
  profileImage: {
    height: 80,
    width: 80,
    borderRadius: 50,
  },
  name: {
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
  },
  descriptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  description1: {
    padding: 5,
  },
  line: {
    padding: 5,
    borderRadius: 10,
    marginBottom: 5,
    marginRight: 10,
    backgroundColor: "gray",
  },
});
