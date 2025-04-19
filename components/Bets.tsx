// components/Bets.tsx
import { View, Text, StyleSheet, Image } from "react-native";
import { useRecoilState } from "recoil";
import { selectedBetState } from "@/recoil/atoms";

export default function Bets() {
  const [selectedBet, setSelectedBet] = useRecoilState(selectedBetState);

  return (
    <View style={styles.modal}>
      {selectedBet.map((bet) => {
        return (
          <View key={bet.name}>
            <Image
              style={styles.pic}
              source={{ uri: bet.picture }}
              resizeMode="contain"
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    position: "absolute",
    flexDirection: "row",
    bottom: 100,
    left: 16,
    right: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 10,
    zIndex: 999,
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
  },
  close: {
    marginTop: 10,
    color: "#007AFF",
  },
  pic: {
    height: 40,
    width: 40,
    borderRadius: 50,
  },
});
