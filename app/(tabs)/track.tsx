import LiveBets from "@/components/LiveBets";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function Track() {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const switchTo = (index: number) => {
    Animated.timing(translateX, {
      toValue: -index * screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeIndex === 0 && styles.activeButton,
            { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
          ]}
          onPress={() => switchTo(0)}
        >
          <Text
            style={[styles.toggleText, activeIndex === 0 && styles.activeText]}
          >
            Live
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeIndex === 1 && styles.activeButton,
            { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
          ]}
          onPress={() => switchTo(1)}
        >
          <Text
            style={[styles.toggleText, activeIndex === 1 && styles.activeText]}
          >
            Results
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animated Sliding Components */}
      <Animated.View
        style={{
          flexDirection: "row",
          width: screenWidth * 2,
          transform: [{ translateX }],
        }}
      >
        <View style={styles.screen}>
          <LiveBets />
        </View>
        <View style={[styles.screen, { backgroundColor: "#F08080" }]}>
          <Text style={styles.text}>Component B</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    marginVertical: 16,
    marginHorizontal: 60,
    alignSelf: "center",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#f0f0f0",
    flex: 1,
    alignItems: "center",
  },
  toggleText: {
    color: "#555",
    fontWeight: "600",
  },
  activeButton: {
    backgroundColor: "#333",
  },
  activeText: {
    color: "#fff",
  },
  screen: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
