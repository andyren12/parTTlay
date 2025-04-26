import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRecoilState } from "recoil";
import { selectedBetState } from "@/recoil/atoms";
import { PARTICIPANTS } from "@/constants/participants";

type LineCardProps = {
  pledge: {
    id: string;
    name: string;
    picture: string;
    type: string;
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
  console.log(selectedBet);

  const handleSelectParticipant = (participant: string, lineObj: any) => {
    setSelectedBet((prev: any[]) => {
      const exists = prev.find(
        (b) => b.id === lineObj.id && b.participant === participant
      );

      if (exists) {
        return prev.filter(
          (b) => !(b.id === lineObj.id && b.participant === participant)
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
          participant,
          type: "firstToComplete",
        },
      ];
    });
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
                  type: "simple",
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
                {pledge.type === "person" && <Text>{lineObj.line}</Text>}
                <Text>{lineObj.title}</Text>
              </View>

              {pledge.type === "person" ? (
                <View style={{ flexDirection: "row", marginRight: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      selected?.status === "Over" && {
                        backgroundColor: "gray",
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
                        backgroundColor: "gray",
                      },
                    ]}
                    onPress={() => toggleBet("Under")}
                  >
                    <Text>Under</Text>
                    {Array.isArray(lineObj.wagers) &&
                      lineObj.wagers.length > 0 &&
                      underOdds !== 1 && (
                        <Text style={{ textAlign: "center" }}>
                          {underOdds}x
                        </Text>
                      )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.participantGrid}>
                  {PARTICIPANTS.map((name) => (
                    <TouchableOpacity
                      key={name}
                      style={[
                        styles.participantButton,
                        selected?.participant === name && {
                          backgroundColor: "gray",
                        },
                      ]}
                      onPress={() => handleSelectParticipant(name, lineObj)}
                    >
                      <Text style={{ textAlign: "center" }}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
    backgroundColor: "lightgray",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 5,
  },
  participantGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop: 10,
  },
  participantButton: {
    backgroundColor: "lightgray",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    margin: 5,
    minWidth: 80,
    alignItems: "center",
  },
});
