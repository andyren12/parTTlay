import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import CompleteLineCard from "@/components/CompleteLineCard";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";

type Prop = {
  id: string;
  name: string;
  picture: string;
  lines: string[];
};

export default function completeLines() {
  const [props, setProps] = useState<Prop[]>([]);
  const [detailedLines, setDetailedLines] = useState<{
    [propId: string]: any[];
  }>({});

  useEffect(() => {
    const fetchProps = async () => {
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
    };

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

  return (
    <SafeAreaView>
      <BackButton />
      <ScrollView contentContainerStyle={styles.container}>
        {props.map((prop) => (
          <CompleteLineCard
            key={prop.id}
            pledge={{
              id: prop.id,
              name: prop.name,
              picture: prop.picture,
              lines: detailedLines[prop.id] || [],
            }}
            setProps={setProps}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
