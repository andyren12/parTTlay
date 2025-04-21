import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRecoilState } from "recoil";
import { selectedBetState } from "@/recoil/atoms";

type LineCardProps = {
  pledge: {
    id: string;
    name: string;
    picture: string;
    lines: any[];
  };
  calculateOdds: (wagers: Wager[]) => { overOdds: number; underOdds: number };
};

type Wager = {
  userId: string;
  name: string;
  amount: number;
  over: boolean;
  wagerId: string;
};

export default function LineCard({ pledge, calculateOdds }: LineCardProps) {
  const [selectedBet, setSelectedBet] = useRecoilState(selectedBetState);

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
          const selected = selectedBet.find((b) => b.id === lineObj.id);

          const { overOdds, underOdds } = calculateOdds(lineObj.wagers || []);

          const toggleBet = (status: "Over" | "Under") =>
            setSelectedBet((prev = []) => {
              const exists = prev.find(
                (b) => b.id === lineObj.id && b.status === status
              );

              if (exists) {
                return prev.filter(
                  (b) => !(b.id === lineObj.id && b.status === status)
                );
              }

              return [
                ...prev.filter((b) => b.propId !== lineObj.propId),
                {
                  id: lineObj.id,
                  propId: pledge.id,
                  name: pledge.name,
                  picture: pledge.picture,
                  title: lineObj.title,
                  status,
                  line: lineObj.line,
                  odds: status === "Over" ? overOdds : underOdds,
                },
              ];
            });

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
                  onPress={() => toggleBet("Over")}
                >
                  <Text>Over</Text>
                  {Array.isArray(lineObj.wagers) &&
                    lineObj.wagers.length > 0 &&
                    overOdds !== 1 && (
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
                  onPress={() => toggleBet("Under")}
                >
                  <Text>Under</Text>
                  {Array.isArray(lineObj.wagers) &&
                    lineObj.wagers.length > 0 &&
                    underOdds !== 1 && (
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
