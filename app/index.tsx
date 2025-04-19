import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/authScreen");
    }
  }, [user, loading]);

  return null;
}
