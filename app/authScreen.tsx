import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { router } from "expo-router";
import { db } from "@/firebaseConfig";

export default function AuthScreen() {
  const auth = getAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", userCred.user.uid), {
          email: userCred.user.email,
          firstName: firstName,
          lastName: lastName,
          createdAt: new Date(),
          balance: 0,
        });

        Alert.alert("Success", `Signed up as ${userCred.user.email}`);
      } else {
        const userCred = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        Alert.alert("Success", `Signed in as ${userCred.user.email}`);
      }

      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Signed out");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? "Sign Up" : "Sign In"}</Text>

      {isSignUp && (
        <View>
          <TextInput
            placeholder="First Name"
            value={firstName}
            autoCapitalize="none"
            onChangeText={setFirstName}
            style={styles.input}
          />

          <TextInput
            placeholder="Last Name"
            value={lastName}
            autoCapitalize="none"
            onChangeText={setLastName}
            style={styles.input}
          />
        </View>
      )}
      <TextInput
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      <Button
        title={loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        onPress={handleAuth}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20 }}>
        <Button title="Sign Out" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toggleText: {
    textAlign: "center",
    marginTop: 10,
    color: "#007AFF",
  },
});
