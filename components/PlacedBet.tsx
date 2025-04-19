import { selectedBetState } from "@/recoil/atoms";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRecoilState } from "recoil";

type Bet = {
  id: string;
  propId: string;
  name: string;
  picture: string;
  title: string;
  status: string;
  line: number;
  odds: number;
};

export default function PlacedBet({ bet }: { bet: Bet }) {
  const [selectedBet, setSelectedBet] = useRecoilState(selectedBetState);
  {
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
            <Text>{bet.line}</Text>
            <Text>{bet.title}</Text>
          </View>
          <View style={{ flexDirection: "row", marginRight: 10 }}>
            <TouchableOpacity
              style={[
                styles.button,
                bet.status === "Over" && { backgroundColor: "lightgray" },
              ]}
              onPress={() =>
                setSelectedBet((prev) => [
                  ...(prev || []).filter((b) => b.name !== bet.name),
                  {
                    id: bet.id,
                    propId: bet.propId,
                    name: bet.name,
                    picture: bet.picture,
                    title: bet.title,
                    status: "Over",
                    line: bet.line,
                    odds: bet.odds,
                  },
                ])
              }
            >
              <Text>Over</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                bet.status === "Under" && { backgroundColor: "lightgray" },
              ]}
              onPress={() =>
                setSelectedBet((prev) => [
                  ...(prev || []).filter((b) => b.name !== bet.name),
                  {
                    id: bet.id,
                    propId: bet.propId,
                    name: bet.name,
                    picture: bet.picture,
                    title: bet.title,
                    status: "Under",
                    line: bet.line,
                    odds: bet.odds,
                  },
                ])
              }
            >
              <Text>Under</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
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
