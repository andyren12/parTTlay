import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type liveBet = {
  amount: number;
  lineId: string;
  over: boolean;
  propId: string;
  wagerId: string;
};

type Wager = {
  userId: string;
  name: string;
  amount: number;
  over: boolean;
  wagerId: string;
};

export default function LiveBetsCard({ bet }: { bet: liveBet }) {
  const [name, setName] = useState("");
  const [picture, setPicture] = useState("");
  const [line, setLine] = useState(0);
  const [title, setTitle] = useState("");
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [expectedPayout, setExpectedPayout] = useState<number>(0);

  useEffect(() => {
    const fetchProp = async () => {
      const propRef = doc(db, "props", bet.propId);
      const propSnap = await getDoc(propRef);
      const propData = propSnap.data();
      setName(propData?.name || "");
      setPicture(propData?.picture || "");
    };

    const fetchLine = async () => {
      const lineRef = doc(db, "lines", bet.lineId);
      const lineSnap = await getDoc(lineRef);
      const lineData = lineSnap.data();
      setLine(lineData?.line || 0);
      setTitle(lineData?.title || "");
      setWagers(lineData?.wagers || []);
    };

    fetchProp();
    fetchLine();
  }, [bet.lineId, bet.propId]);

  useEffect(() => {
    const calculateExpectedPayout = (wagers: Wager[]) => {
      if (!wagers) return;

      const isOver = bet.over;
      const userAmount = bet.amount;

      const sameSideWagers = wagers.filter(
        (w) => w.over === isOver && w.wagerId !== bet.wagerId
      );
      const otherSideWagers = wagers.filter((w) => w.over !== isOver);

      const sameSideTotal = sameSideWagers.reduce(
        (sum, w) => sum + w.amount,
        0
      );
      const otherSideTotal = otherSideWagers.reduce(
        (sum, w) => sum + w.amount,
        0
      );

      const fullSameSideTotal = sameSideTotal + userAmount;

      if (fullSameSideTotal > 0 && otherSideTotal > 0) {
        const userShare = userAmount / fullSameSideTotal;
        const payout = userAmount + userShare * otherSideTotal;
        setExpectedPayout(Number(payout.toFixed(2)));
      } else {
        setExpectedPayout(userAmount);
      }
    };

    calculateExpectedPayout(wagers);
  }, [wagers, bet]);

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
        <Text style={styles.description1}>{title}</Text>
        <View style={styles.line}>
          <Text style={styles.description1}>
            {bet.over ? "Over" : "Under"} {line}
          </Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <View style={{ alignItems: "center" }}>
          <Text>Entry</Text>
          <Text>${bet.amount}</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text>Multiplier</Text>
          <Text>{(expectedPayout / bet.amount).toFixed(2)}x</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text>Payout</Text>
          <Text>${expectedPayout}</Text>
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
