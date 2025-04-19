import { db } from "@/firebaseConfig";
import { selectedBetState } from "@/recoil/atoms";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRecoilState } from "recoil";

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

export default function Props() {
  const [props, setProps] = useState<Prop[]>([]);
  const [selectedBet, setSelectedBet] = useRecoilState(selectedBetState);
  const [detailedLines, setDetailedLines] = useState<{
    [propId: string]: any[];
  }>({});

  function calculateOdds(wagers: Wager[]) {
    if (wagers) {
      const overTotal = wagers
        .filter((w) => w.over)
        .reduce((sum, w) => sum + w.amount, 0);

      const underTotal = wagers
        .filter((w) => !w.over)
        .reduce((sum, w) => sum + w.amount, 0);

      let overOdds = 0;
      let underOdds = 0;

      if (overTotal > 0 && underTotal > 0) {
        overOdds = +(underTotal / overTotal).toFixed(2);
        underOdds = +(overTotal / underTotal).toFixed(2);
      } else if (overTotal > 0 && underTotal === 0) {
        overOdds = 0;
        underOdds = overTotal;
      } else if (underTotal > 0 && overTotal === 0) {
        overOdds = underTotal;
        underOdds = 0;
      }

      return { overOdds, underOdds };
    }
    return {
      overOdds: 1,
      underOdds: 1,
    };
  }

  useEffect(() => {
    const fetchLines = async () => {
      const querySnapshot = await getDocs(collection(db, "props"));
      const propList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProps(propList);
    };

    fetchLines();
  }, []);

  useEffect(() => {
    const fetchAllDetailedLines = async () => {
      const updated: { [propId: string]: any[] } = {};

      for (const prop of props) {
        const lines: any[] = [];

        for (const lineId of prop.lines) {
          const docRef = doc(db, "lines", lineId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            lines.push({ id: lineId, ...docSnap.data() });
          }
        }

        updated[prop.id] = lines;
      }

      setDetailedLines(updated);
    };

    if (props.length > 0) {
      fetchAllDetailedLines();
    }
  }, [props]);

  function LineCard({ pledge }: { pledge: Prop }) {
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
          {(detailedLines[pledge.id] || []).map((lineObj, index) => {
            const selected = selectedBet.find(
              (b) => b.name === pledge.name && b.title === lineObj.title
            );

            const { overOdds, underOdds } = calculateOdds(lineObj.wagers);

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
                    style={[
                      styles.button,
                      selected?.status === "Over" && {
                        backgroundColor: "lightgray",
                      },
                    ]}
                    onPress={() =>
                      setSelectedBet((prev = []) => {
                        const exists = prev.find(
                          (b) => b.id === lineObj.id && b.status === "Over"
                        );

                        if (exists) {
                          return prev.filter(
                            (b) => !(b.id === lineObj.id && b.status === "Over")
                          );
                        }

                        return [
                          ...prev.filter((b) => b.id !== lineObj.id),
                          {
                            id: lineObj.id,
                            propId: pledge.id,
                            name: pledge.name,
                            picture: pledge.picture,
                            title: lineObj.title,
                            status: "Over",
                            line: lineObj.line,
                            odds: underOdds,
                          },
                        ];
                      })
                    }
                  >
                    <Text>Over</Text>
                    {overOdds !== 1 && (
                      <Text style={{ textAlign: "center" }}>{overOdds}x</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      selected?.status === "Under" && {
                        backgroundColor: "lightgray",
                      },
                    ]}
                    onPress={() =>
                      setSelectedBet((prev = []) => {
                        const exists = prev.find(
                          (b) => b.id === lineObj.id && b.status === "Under"
                        );

                        if (exists) {
                          return prev.filter(
                            (b) =>
                              !(b.id === lineObj.id && b.status === "Under")
                          );
                        }

                        return [
                          ...prev.filter((b) => b.id !== lineObj.id),
                          {
                            id: lineObj.id,
                            propId: pledge.id,
                            name: pledge.name,
                            picture: pledge.picture,
                            title: lineObj.title,
                            status: "Under",
                            line: lineObj.line,
                            odds: underOdds,
                          },
                        ];
                      })
                    }
                  >
                    <Text>Under</Text>
                    {underOdds !== 1 && (
                      <Text style={{ textAlign: "center" }}>{underOdds}x</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {props.map((prop) => (
        <LineCard key={prop.name} pledge={prop} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
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
