// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        const docRef = doc(db, "users", authUser.uid);

        // Listen to real-time updates from Firestore
        const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: authUser.uid, ...docSnap.data() });
          } else {
            console.warn("No user doc found in Firestore");
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribeDoc(); // clean up Firestore listener
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // clean up auth listener
  }, []);

  return { user, loading };
}
