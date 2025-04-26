import BackButton from "@/components/BackButton";
import CreateLineCard from "@/components/CreateLineCard";
import { db } from "@/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type Prop = {
  id: string;
  name: string;
  picture: string;
  type: string;
  lines: string[];
};

export default function createLines() {
  const [props, setProps] = useState<Prop[]>([]);
  const [detailedLines, setDetailedLines] = useState<{
    [propId: string]: any[];
  }>({});

  useEffect(() => {
    const fetchProps = async () => {
      const querySnapshot = await getDocs(collection(db, "props"));
      const propList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProps(propList);
    };

    fetchProps();
  }, []);

  useEffect(() => {
    const fetchAllDetailedLines = async () => {
      const updated: { [propId: string]: any[] } = {};

      for (const prop of props) {
        if (!Array.isArray(prop.lines)) continue;

        const lines: any[] = [];

        for (const lineId of prop.lines) {
          try {
            const docRef = doc(db, "lines", lineId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const lineData = { id: lineId, ...docSnap.data() };
              lines.push(lineData);
            }
          } catch (err) {
            console.error("Failed to fetch line:", lineId, err);
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
          <CreateLineCard
            key={prop.id}
            pledge={{
              id: prop.id,
              name: prop.name,
              picture: prop.picture,
              type: prop.type,
              lines: detailedLines[prop.id] || [],
            }}
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
