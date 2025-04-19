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
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useRef, useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { router } from "expo-router";

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
  status: string;
  line: number;
  odds: number;
};

export default function track() {
  const { user, loading } = useAuth();
  const [selectedBet, setSelectedBet] = useRecoilState(selectedBetState);
  const [betAmount, setBetAmount] = useState("");
  const [payout, setPayout] = useState("");
  const [currentSnap, setCurrentSnap] = useState(SNAP_TOP);
  const panY = useRef(new Animated.Value(SNAP_TOP)).current;

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

  useEffect(() => {
    if (betAmount === "") {
      setPayout("");
      return;
    }

    const timeout = setTimeout(() => {
      const amount = parseFloat(betAmount);
      if (!isNaN(amount)) {
      }
    }, 500);

    return () => clearTimeout(timeout); // cleanup previous timeout
  }, [betAmount]);

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
              value={betAmount}
              onChangeText={(e) => setBetAmount(e)}
              onFocus={snapToInput}
              style={styles.input}
            />
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
  },
});
