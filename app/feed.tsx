import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { db } from "@/firebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

type FeedItem = {
  id: string;
  message: string;
  picture: string;
  createdAt: any;
};

export default function Feed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  function timeAgo(timestamp: any): string {
    if (!timestamp) return "";

    const now = new Date();
    const createdAt = new Date(timestamp.seconds * 1000);
    const diff = Math.floor((now.getTime() - createdAt.getTime()) / 1000); // seconds

    if (diff < 60) return "just now";

    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  useEffect(() => {
    const feedRef = collection(db, "feed");
    const q = query(feedRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FeedItem[];

      setFeed(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={
                item.picture
                  ? { uri: item.picture }
                  : require("../assets/images/default-profile.png")
              }
              style={styles.profilePicture}
            />
            <View style={styles.textContainer}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fdfdfd",
    width: "100%",
    flex: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: "flex-start",
  },
  profilePicture: {
    height: 50,
    width: 50,
    borderRadius: 50,
    marginRight: 10, // add spacing between image and text
  },
  textContainer: {
    flex: 1,
  },
  message: {
    flexShrink: 1,
    fontSize: 14,
  },
  time: {
    marginTop: 4,
    color: "gray",
    fontSize: 12,
  },
});
