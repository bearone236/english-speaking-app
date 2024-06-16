import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const saveEvaluationResult = async (
  userId: string,
  theme: string,
  transcript: string,
  evaluation: string
) => {
  try {
    await addDoc(collection(db, "evaluations"), {
      userId,
      theme,
      transcript,
      evaluation,
      timestamp: new Date(),
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getEvaluationHistory = async (userId: string) => {
  const q = query(collection(db, "evaluations"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const history = querySnapshot.docs.map((doc) => doc.data());
  return history;
};
