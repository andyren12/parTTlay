import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
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
