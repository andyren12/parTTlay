import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import {
  Timestamp,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { PARTICIPANTS } from "@/constants/participants";

type LineCardProps = {
  pledge: {
    id: string;
    name: string;
    picture: string;
    lines: any[];
    type: string;
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
  id: string;
  userId: string;
  name: string;
  amount: number;
  over?: boolean; // Only for simple bets
  participant?: string; // Only for firstToComplete
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
          const selectBet = async (result: any) => {
            try {
              const lineRef = doc(db, "lines", lineObj.id);
              const lineSnap = await getDoc(lineRef);

              if (!lineSnap.exists()) return;

              const lineData = lineSnap.data();
              const wagers: Wager[] = lineData.wagers || [];
              const isSimple = lineData.type === "simple";

              const allWagers = wagers;
              const hasOpposition = wagers.length > 1;

              let winners: Wager[] = [];
              let losers: Wager[] = [];
              let totalPool = wagers.reduce((sum, w) => sum + w.amount, 0);

              if (isSimple) {
                const isOver = result === "Over";

                winners = wagers.filter((w) => w.over === isOver);
                losers = wagers.filter((w) => w.over !== isOver);
              } else {
                winners = wagers.filter((w) => w.participant === result);
                losers = wagers.filter((w) => w.participant !== result);
              }

              const totalWinning = winners.reduce(
                (sum, w) => sum + w.amount,
                0
              );
              const totalLosing = losers.reduce((sum, w) => sum + w.amount, 0);

              for (const wager of allWagers) {
                const userRef = doc(db, "users", wager.userId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                const currentWagers = userData.currentWagers || [];

                const updatedCurrentWagers = currentWagers.filter(
                  (w: Wager) => w.id !== wager.id
                );

                const updateData: any = {
                  currentWagers: updatedCurrentWagers,
                };

                if (hasOpposition) {
                  const isWinner =
                    lineData.type === "simple"
                      ? winners.find((w) => w.id === wager.id)
                      : wager.participant === result;

                  let payout = 0;

                  if (isWinner) {
                    if (isSimple) {
                      const userShare = wager.amount / totalWinning;
                      payout = wager.amount + userShare * totalLosing;
                    } else {
                      const userShare = wager.amount / totalWinning;
                      payout = userShare * totalPool;
                    }

                    updateData.balance = increment(payout);
                  }

                  const completedWager = {
                    ...wager,
                    result: isWinner ? "win" : "lose",
                    propId: lineData.propId,
                    title: lineData.title,
                    line: isSimple
                      ? result === "Over"
                        ? `Over ${lineData.line}`
                        : `Under ${lineData.line}`
                      : `Winner: ${result}`,
                    completedAt: Timestamp.now(),
                    payout,
                  };

                  updateData.completedWagers = arrayUnion(completedWager);
                } else {
                  // Refund entry if no competition
                  updateData.balance = increment(wager.amount);
                }

                await updateDoc(userRef, updateData);
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
                alignItems: "center",
              }}
            >
              <View style={styles.line}>
                {pledge.type === "person" && <Text>{lineObj.line}</Text>}
                <Text>{lineObj.title}</Text>
              </View>

              <View style={{ flexDirection: "row", marginRight: 10 }}>
                {lineObj.type === "simple" ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <View style={styles.participantGrid}>
                      {PARTICIPANTS.map((name) => (
                        <TouchableOpacity
                          key={name}
                          style={styles.button}
                          onPress={() => selectBet(name)}
                        >
                          <Text style={{ textAlign: "center" }}>{name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
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
  participantGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop: 10,
  },
});
