import { selectedBetState } from "@/recoil/atoms";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRecoilState } from "recoil";

type Bet = {
  id: string;
  propId: string;
  name: string;
  picture: string;
  title: string;
  type: "simple" | "firstToComplete";
  status?: "Over" | "Under";
  line?: number;
  odds?: number;
  participant?: string;
};

export default function PlacedBet({ bet }: { bet: Bet }) {
  const [selectedBet, setSelectedBet] = useRecoilState(selectedBetState);

  let overOdds = 0,
    underOdds = 0;
  if (bet.odds) {
    overOdds = bet.status === "Over" ? bet.odds : 1 / bet.odds;
    underOdds = 1 / overOdds;
  }

  return (
    <View style={styles.card}>
      <View style={styles.title}>
        <Image
          source={{ uri: bet.picture }}
          style={styles.profileImage}
          resizeMode="contain"
        />
        <Text style={styles.name}>{bet.name}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={styles.line}>
          {bet.type === "simple" && (
            <>
              <Text>{bet.line}</Text>
              <Text>{bet.title}</Text>
            </>
          )}
          {bet.type === "firstToComplete" && <Text>{bet.title}</Text>}
        </View>

        {/* Handle differently depending on bet type */}
        {bet.type === "simple" ? (
          <View style={{ flexDirection: "row", marginRight: 10 }}>
            <TouchableOpacity
              style={[
                styles.button,
                bet.status === "Over" && { backgroundColor: "lightgray" },
              ]}
              onPress={() =>
                setSelectedBet((prev = []) => {
                  const exists = prev.find(
                    (b) => b.id === bet.id && b.status === "Over"
                  );
                  if (exists) {
                    return prev.filter((b) => b.id !== bet.id);
                  } else {
                    return [
                      ...prev.filter((b) => b.name !== bet.name),
                      {
                        ...bet,
                        status: "Over",
                      },
                    ];
                  }
                })
              }
            >
              <Text>Over</Text>
              {overOdds !== 0 && <Text>{overOdds.toFixed(2)}x</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                bet.status === "Under" && { backgroundColor: "lightgray" },
              ]}
              onPress={() =>
                setSelectedBet((prev = []) => {
                  const exists = prev.find(
                    (b) => b.id === bet.id && b.status === "Under"
                  );
                  if (exists) {
                    return prev.filter((b) => b.id !== bet.id);
                  } else {
                    return [
                      ...prev.filter((b) => b.name !== bet.name),
                      {
                        ...bet,
                        status: "Under",
                      },
                    ];
                  }
                })
              }
            >
              <Text>Under</Text>
              {underOdds !== 0 && <Text>{underOdds.toFixed(2)}x</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, { marginRight: 10 }]}
            onPress={() =>
              setSelectedBet((prev = []) => prev.filter((b) => b.id !== bet.id))
            }
          >
            <Text>{bet.participant}</Text>
          </TouchableOpacity>
        )}
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
