import BackButton from "@/components/BackButton";
import PlacedBet from "@/components/PlacedBet";
import { useAuth } from "@/hooks/useAuth";
import { selectedBetState } from "@/recoil/atoms";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Dimensions,
  Animated,
  PanResponder,
  Easing,
  Keyboard,
  Alert,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useRef, useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { router } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import uuid from "react-native-uuid";

const screenHeight = Dimensions.get("window").height;
const SNAP_TOP = screenHeight * 0.6;
const SNAP_BOTTOM = screenHeight * 0.85;
const SNAP_INPUT = screenHeight * 0.3;

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

export default function currentBets() {
  const { user, loading } = useAuth();
  const [selectedBet, setSelectedBet] = useRecoilState(selectedBetState);
  const [betAmount, setBetAmount] = useState("");
  const [payout, setPayout] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [currentSnap, setCurrentSnap] = useState(SNAP_TOP);
  const panY = useRef(new Animated.Value(SNAP_TOP)).current;
  const [overBet, setOverBet] = useState(false);

  const deposit = () => {
    router.push("/deposit");
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 10,

      onPanResponderGrant: () => {
        panY.setOffset(panY.__getValue());
        panY.setValue(0);
      },

      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: (_, gestureState) => {
        panY.flattenOffset();

        const snapTo =
          gestureState.dy < -50
            ? SNAP_TOP
            : gestureState.dy > 50
            ? SNAP_BOTTOM
            : Math.abs(gestureState.dy) > (SNAP_BOTTOM - SNAP_TOP) / 2
            ? SNAP_BOTTOM
            : SNAP_TOP;

        setCurrentSnap(snapTo);

        Animated.timing(panY, {
          toValue: snapTo,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
        Keyboard.dismiss();
      },
    })
  ).current;

  useEffect(() => {
    panY.setValue(currentSnap);
  }, []);

  const snapToInput = () => {
    setCurrentSnap(SNAP_INPUT);
    Animated.timing(panY, {
      toValue: SNAP_INPUT,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };
  async function calculateProjectedPayout() {
    if (!selectedBet.length || parseInt(betAmount) <= 0) return 0;

    const amountPerBet = parseInt(betAmount) / selectedBet.length;
    let totalPayout = 0;

    for (const bet of selectedBet) {
      const lineRef = doc(db, "lines", bet.id);
      const lineSnap = await getDoc(lineRef);

      if (!lineSnap.exists()) continue;

      const lineData = lineSnap.data();
      const existingWagers = lineData.wagers || [];

      if (bet.type === "simple") {
        // Old simple bet payout logic
        const simulatedWagers = [
          ...existingWagers,
          {
            amount: amountPerBet,
            over: bet.status === "Over",
          },
        ];

        const overTotal = simulatedWagers
          .filter((w) => w.over)
          .reduce((sum, w) => sum + w.amount, 0);

        const underTotal = simulatedWagers
          .filter((w) => !w.over)
          .reduce((sum, w) => sum + w.amount, 0);

        let odds = 0;
        if (bet.status === "Over") {
          odds = overTotal > 0 ? underTotal / overTotal : 0;
        } else {
          odds = underTotal > 0 ? overTotal / underTotal : 0;
        }

        const payout = amountPerBet * odds;
        totalPayout += payout;
      } else if (bet.type === "firstToComplete") {
        // New first to complete payout logic
        const simulatedWagers = [
          ...existingWagers,
          {
            amount: amountPerBet,
            participant: bet.participant,
          },
        ];

        const totalPool = simulatedWagers.reduce((sum, w) => sum + w.amount, 0);

        const myTotal = simulatedWagers
          .filter((w) => w.participant === bet.participant)
          .reduce((sum, w) => sum + w.amount, 0);

        const opponentTotal = totalPool - myTotal;

        // odds = how much "other" money divided by "your" money
        const odds = myTotal > 0 ? opponentTotal / myTotal : 0;

        const payout = amountPerBet * (1 + odds);
        // (1 + odds) because you also get your bet amount back
        totalPayout += payout;
      }
    }

    return totalPayout;
  }

  useEffect(() => {
    if (betAmount === "") {
      setPayout("");
      return;
    }

    if (parseInt(betAmount) > user?.balance) {
      setOverBet(true);
      return;
    } else {
      setOverBet(false);
    }

    const timeout = setTimeout(async () => {
      const amount = parseFloat(betAmount);
      if (!isNaN(amount)) {
        const projPayout = await calculateProjectedPayout();
        setPayout(projPayout.toFixed(2));
        setMultiplier((projPayout / parseInt(betAmount)).toFixed(2) + "x");
      }
    }, 750);

    return () => clearTimeout(timeout);
  }, [betAmount]);

  const placeBets = async () => {
    try {
      const amountPerBet = parseInt(betAmount) / selectedBet.length;
      if (!selectedBet.length || isNaN(amountPerBet)) {
        Alert.alert("Invalid bet", "Please select bets and enter an amount.");
        return;
      }

      await Promise.all(
        selectedBet.map(async (bet) => {
          const lineRef = doc(db, "lines", bet.id);
          const lineSnap = await getDoc(lineRef);
          if (!lineSnap.exists()) return;
          const lineData = lineSnap.data();
          const wagerId = uuid.v4();

          const userRef = doc(db, "users", user?.uid);

          let message = "";

          if (bet.type === "simple") {
            // Simple over/under wager
            const lineWager = {
              wagerId: wagerId,
              name: user?.firstName,
              userId: user?.uid,
              amount: amountPerBet,
              over: bet.status === "Over",
              type: bet.type,
            };

            const userWager = {
              wagerId: wagerId,
              lineId: bet.id,
              propId: bet.propId,
              amount: amountPerBet,
              over: bet.status === "Over",
              type: bet.type,
            };

            await updateDoc(lineRef, {
              wagers: arrayUnion(lineWager),
            });

            await updateDoc(userRef, {
              currentWagers: arrayUnion(userWager),
              balance: user?.balance - parseInt(betAmount),
            });

            // Create message for simple bet
            message = `${user?.firstName} ${
              user?.lastName
            } bet $${amountPerBet} on ${lineData.propName || bet.name} ${
              bet.status
            } ${lineData.line} ${lineData.title}`;
          } else if (bet.type === "firstToComplete") {
            // First to Complete wager
            const lineWager = {
              wagerId: wagerId,
              name: user?.firstName,
              userId: user?.uid,
              amount: amountPerBet,
              participant: bet.participant,
              type: bet.type,
            };

            const userWager = {
              wagerId: wagerId,
              lineId: bet.id,
              propId: bet.propId,
              amount: amountPerBet,
              participant: bet.participant,
              type: bet.type,
            };

            await updateDoc(lineRef, {
              wagers: arrayUnion(lineWager),
            });

            await updateDoc(userRef, {
              currentWagers: arrayUnion(userWager),
              balance: user?.balance - parseInt(betAmount),
            });

            // Create message for first to complete
            message = `${user?.firstName} ${
              user?.lastName
            } bet $${amountPerBet} on ${bet.participant || bet.name} to be ${
              lineData.title
            }`;
          }

          // Save to feed
          if (message) {
            await addDoc(collection(db, "feed"), {
              message,
              createdAt: serverTimestamp(),
            });
          }
        })
      );

      setSelectedBet([]);
      router.back();
      Alert.alert("Success", "Your bets have been placed!");
    } catch (err) {
      console.error("Error placing bets:", err);
      Alert.alert("Error", "Something went wrong while placing your bets.");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <BackButton />
        <TouchableOpacity style={styles.balanceButton} onPress={deposit}>
          <Text>{(user?.balance ?? 0).toFixed(2)}+</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container}>
          {selectedBet.map((bet: Bet) => (
            <PlacedBet key={bet.id} bet={bet} />
          ))}
        </ScrollView>

        {/* Draggable Snap Modal */}
        <Animated.View
          style={[
            styles.snapModal,
            {
              transform: [{ translateY: panY }],
              height: screenHeight,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragBarContainer}>
            <View style={styles.dragBar} />
          </View>

          <View style={styles.snapContent}>
            <Text style={styles.modalHeader}>Entry Amount: </Text>
            <TextInput
              keyboardType="numeric"
              placeholder="$ Amount"
              placeholderTextColor={"gray"}
              value={betAmount}
              onChangeText={(e) => setBetAmount(e)}
              onFocus={snapToInput}
              style={styles.input}
            />
            {overBet && (
              <Text style={{ color: "red" }}>
                Bet must be less than current balance.
              </Text>
            )}

            <Text style={styles.modalHeader}>Payout: </Text>
            <View style={styles.payout}>
              <Text>{payout}</Text>
              <Text style={{ color: "green" }}>{multiplier}</Text>
            </View>
            <TouchableOpacity
              style={[styles.playButton, overBet && styles.playButtonDisabled]}
              disabled={overBet}
              onPress={placeBets}
            >
              <Text>Play</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 120,
    paddingBottom: 100,
  },
  balanceButton: {
    position: "absolute",
    right: 20,
    top: 80,
    backgroundColor: "gray",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 999,
  },
  snapModal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dragBarContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 5,
  },
  dragBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
  snapContent: {
    padding: 20,
  },
  modalHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  payout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  playButton: {
    backgroundColor: "gray",
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  playButtonDisabled: {
    backgroundColor: "lightgray",
  },
});
