import { useAuth } from "@/hooks/useAuth";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profilePicture) {
      setProfileImage(user.profilePicture);
    }
  }, [user]);

  const pickAndUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets.length) return;

    const asset = result.assets[0];
    const fileName = `profile-${Date.now()}.jpg`;
    const fileType = "image/jpeg";

    try {
      const res = await fetch("http://localhost:3001/api/getPresignedUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType, oldUrl: profileImage }),
      });

      const { url } = await res.json();

      const fileBlob = await (await fetch(asset.uri)).blob();

      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: fileBlob,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image to S3");
      }

      const imageUrl = url.split("?")[0];
      setProfileImage(imageUrl);
      console.log(imageUrl);

      // Step 3: Save image URL to Firestore
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { profilePicture: imageUrl });
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Could not upload image.");
    }
  };

  if (loading) return null;

  return (
    <View style={styles.main}>
      <TouchableOpacity onPress={pickAndUploadImage}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("../../assets/images/default-profile.png")
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <Text>
        {user?.firstName} {user?.lastName}
      </Text>

      <Button
        title="Sign Out"
        onPress={() => {
          signOut(auth);
          router.replace("/authScreen");
        }}
      />

      {user?.email === "andyren33@gmail.com" && (
        <View>
          <TouchableOpacity onPress={() => router.push("/createLines")}>
            <Text>Create Lines</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/completeLines")}>
            <Text>Complete Lines</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    marginBottom: 16,
  },
});
