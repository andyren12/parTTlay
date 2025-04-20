import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRecoilState } from "recoil";
import { selectedBetState } from "@/recoil/atoms";
import {
  arrayRemove,
  deleteDoc,
  doc,
  getDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

type LineCardProps = {
  pledge: {
    id: string;
    name: string;
    picture: string;
    lines: any[];
  };
  setProps: (props: any) => void;
};

type Prop = {
  id: string;
  name: string;
  picture: string;
  lines: string[];
};

type Wager = {
  userId: string;
  name: string;
  amount: number;
  over: boolean;
};

export default function CompleteLineCard({ pledge, setProps }: LineCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.title}>
        <Image
          source={{ uri: pledge.picture }}
          style={styles.profileImage}
          resizeMode="contain"
        />
        <Text style={styles.name}>{pledge.name}</Text>
      </View>

      <View>
        {pledge.lines.map((lineObj, index) => {
          const selectBet = async (status: "Over" | "Under") => {
            try {
              const lineRef = doc(db, "lines", lineObj.id);
              const lineSnap = await getDoc(lineRef);

              if (!lineSnap.exists()) return;

              const lineData = lineSnap.data();
              const wagers = lineData.wagers || [];

              const isOver = status === "Over";

              const winners = wagers.filter((w: Wager) => w.over === isOver);
              const losers = wagers.filter((w: Wager) => w.over !== isOver);

              const totalWinning = winners.reduce(
                (sum: number, w: Wager) => sum + w.amount,
                0
              );
              const totalLosing = losers.reduce(
                (sum: number, w: Wager) => sum + w.amount,
                0
              );

              if (winners.length > 0 && losers.length > 0) {
                for (const wager of winners) {
                  const userShare = wager.amount / totalWinning;
                  const payout = wager.amount + userShare * totalLosing;

                  const userRef = doc(db, "users", wager.userId);
                  await updateDoc(userRef, {
                    balance: increment(payout),
                  });
                }
              } else {
                const allWagers = [...winners, ...losers];
                for (const wager of allWagers) {
                  const userRef = doc(db, "users", wager.userId);
                  await updateDoc(userRef, {
                    balance: increment(wager.amount),
                  });
                }
              }

              const propRef = doc(db, "props", lineObj.propId);
              await updateDoc(propRef, {
                lines: arrayRemove(lineObj.id),
              });

              await deleteDoc(lineRef);
              setProps((prev: any) =>
                prev.map((prop: Prop) =>
                  prop.id === lineObj.propId
                    ? {
                        ...prop,
                        lines: prop.lines.filter(
                          (lineId) => lineId !== lineObj.id
                        ),
                      }
                    : prop
                )
              );

              console.log("Payouts distributed.");
            } catch (err) {
              console.error("Error distributing payouts:", err);
            }
          };

          return (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={styles.line}>
                <Text>{lineObj.line}</Text>
                <Text>{lineObj.title}</Text>
              </View>
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={async () => await selectBet("Over")}
                >
                  <Text>Over</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={async () => await selectBet("Under")}
                >
                  <Text>Under</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  line: {
    marginHorizontal: 10,
    marginVertical: 5,
    alignItems: "center",
  },
  button: {
    backgroundColor: "gray",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 5,
  },
});
