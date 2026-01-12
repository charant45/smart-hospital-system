import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { db } from "./db"

// Fetch all doctors
export const getDoctors = async () => {
  try {
    const q = query(
      collection(db, "users"),
      where("role", "==", "doctor")
    )

    const snapshot = await getDocs(q)

    const doctors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log("Found doctors:", doctors.length)
    return doctors
  } catch (error) {
    console.error("Error in getDoctors:", error)
    
    // Check for permission errors
    if (error.code === "permission-denied" || error.code === "PERMISSION_DENIED" || error.message?.toLowerCase().includes("permission")) {
      const errorMsg = `PERMISSION_ERROR: Missing or insufficient permissions. Please update Firestore security rules to allow reading users collection where role='doctor'. 
      
Firestore Rules needed:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && resource.data.role == 'doctor';
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`
      throw new Error(errorMsg)
    }
    
    // Check if it's a permission/index error
    if (error.code === "failed-precondition") {
      throw new Error("Firestore index required. Please create a composite index for 'users' collection with 'role' field.")
    }
    
    throw error
  }
}
