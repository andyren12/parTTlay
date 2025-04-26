import { useAuth } from "@/hooks/useAuth";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import Feed from "../feed";

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      const res = await fetch(
        "https://parttlay-production.up.railway.app/api/getPresignedUrl",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName, fileType, oldUrl: profileImage }),
        }
      );

      const { url } = await res.json();
      const fileBlob = await (await fetch(asset.uri)).blob();

      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: fileBlob,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image to S3");

      const imageUrl = url.split("?")[0];
      setProfileImage(imageUrl);

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
    <View style={styles.container}>
      {/* Header with ellipsis */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

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

      <Text style={styles.nameText}>
        {user?.firstName} {user?.lastName}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/createLines")}
        >
          <Text style={styles.actionText}>Create Lines</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/completeLines")}
        >
          <Text style={styles.actionText}>Complete Lines</Text>
        </TouchableOpacity>
      </View>

      <Feed />

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => {
                signOut(auth);
                setModalVisible(false);
                router.replace("/authScreen");
              }}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#fdfdfd",
  },
  header: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#eee",
    marginBottom: 16,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "80%",
    gap: 15,
  },
  actionButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  signOutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
