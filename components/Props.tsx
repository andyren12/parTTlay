import { db } from "@/firebaseConfig";
import { selectedBetState } from "@/recoil/atoms";
import { collection, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSetRecoilState } from "recoil";

type Prop = {
  name: string;
  picture: string;
  lines: Line[];
};

type Line = {
  [title: string]: {
    line: number;
    wagers: Wager[];
  };
};

type Wager = {
  name: string;
  amount: number;
};

export default function Props() {
  const [props, setProps] = useState<Prop[]>([]);
  const setSelectedBet = useSetRecoilState(selectedBetState);

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
          {pledge.lines.map((lineObj, index) => {
            const [title, data] = Object.entries(lineObj)[0];

            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.line}>
                  <Text>{data.line}</Text>
                  <Text>{title}</Text>
                </View>
                <View style={{ flexDirection: "row", marginRight: 10 }}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                      setSelectedBet((prev) => [
                        ...(prev || []),
                        {
                          name: pledge.name,
                          picture: pledge.picture,
                          title: title,
                          status: "Over",
                          line: data.line,
                        },
                      ])
                    }
                  >
                    <Text>Over</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button}>
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
