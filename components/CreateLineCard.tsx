import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { db } from "@/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";

type LineCardProps = {
  pledge: {
    id: string;
    name: string;
    picture: string;
    lines: any[];
  };
};

export default function CreateLineCard({ pledge }: LineCardProps) {
  const [lines, setLines] = useState<any[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLine, setNewLine] = useState("");

  useEffect(() => {
    if (Array.isArray(pledge.lines)) {
      setLines(pledge.lines);
    }
  }, [pledge.lines]);

  const addLine = () => {
    setShowInput(true);
  };

  const completeLine = async () => {
    if (!newTitle || !newLine) return;

    try {
      const lineDoc = await addDoc(collection(db, "lines"), {
        title: newTitle,
        line: parseFloat(newLine),
        wagers: [],
        propId: pledge.id,
      });

      const propRef = doc(db, "props", pledge.id);
      await updateDoc(propRef, {
        lines: arrayUnion(lineDoc.id),
      });

      setLines((prev) => [
        ...prev,
        {
          id: lineDoc.id,
          title: newTitle,
          line: parseFloat(newLine),
          wagers: [],
        },
      ]);

      setNewTitle("");
      setNewLine("");
      setShowInput(false);
    } catch (err) {
      console.error("Error creating line:", err);
    }
  };

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
        {lines.length > 0 &&
          lines.map((lineObj, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
              }}
            >
              <View style={styles.line}>
                <Text>{lineObj.line}</Text>
                <Text>{lineObj.title}</Text>
              </View>
            </View>
          ))}

        {showInput && (
          <View style={{ marginTop: 10, alignItems: "center" }}>
            <TextInput
              placeholder="Title"
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              placeholder="Line"
              style={styles.input}
              keyboardType="numeric"
              value={newLine}
              onChangeText={setNewLine}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: "green" }]}
              onPress={completeLine}
            >
              <Text style={{ color: "white" }}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!showInput && (
        <TouchableOpacity style={styles.addButton} onPress={addLine}>
          <Text>Add Line</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 0.5,
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 10,
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
    width: 200,
  },
  input: {
    height: 40,
    width: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  addButton: {
    backgroundColor: "lightgray",
    width: 100,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
});
