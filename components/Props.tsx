import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import LineCard from "@/components/LineCard";

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
  const [detailedLines, setDetailedLines] = useState<{
    [propId: string]: any[];
  }>({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchProps = async () => {
    setRefreshing(true);
    const querySnapshot = await getDocs(collection(db, "props"));
    const propList = querySnapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Prop)
      )
      .filter((prop) => Array.isArray(prop.lines) && prop.lines.length > 0);

    setProps(propList);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProps();
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

  function calculateOdds(wagers: Wager[]) {
    const overTotal =
      wagers?.filter((w) => w.over).reduce((sum, w) => sum + w.amount, 0) || 0;

    const underTotal =
      wagers?.filter((w) => !w.over).reduce((sum, w) => sum + w.amount, 0) || 0;

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

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchProps} />
      }
    >
      {props.map((prop) => (
        <LineCard
          key={prop.id}
          pledge={{
            id: prop.id,
            name: prop.name,
            picture: prop.picture,
            lines: detailedLines[prop.id] || [],
          }}
          calculateOdds={calculateOdds}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: "100%",
  },
});
