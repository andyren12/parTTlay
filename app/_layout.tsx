import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { RecoilRoot, useRecoilValue } from "recoil";
import { selectedBetState } from "@/recoil/atoms";

import { useColorScheme } from "@/hooks/useColorScheme";
import Bets from "@/components/Bets";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RecoilRoot>
      <LayoutWithModal />
      <StatusBar style="auto" />
    </RecoilRoot>
  );
}

function LayoutWithModal() {
  const selectedBet = useRecoilValue(selectedBetState);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="authScreen" options={{ headerShown: false }} />
        <Stack.Screen name="deposit" options={{ headerShown: false }} />
        <Stack.Screen name="track" options={{ headerShown: false }} />
      </Stack>

      {selectedBet && <Bets />}
    </>
  );
}
