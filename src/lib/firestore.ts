import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export const saveEvaluationResult = async (
  userId: string,
  theme: string,
  transcript: string,
  evaluation: string,
  thinkTime: string,
  speakTime: string,
  level: string
) => {
  try {
    console.log("Saving evaluation result to Firestore...", {
      userId,
      theme,
      transcript,
      evaluation,
      thinkTime,
      speakTime,
      level,
    });

    await addDoc(collection(db, "evaluations"), {
      userId,
      theme,
      transcript,
      evaluation,
      thinkTime,
      speakTime,
      level,
      timestamp: new Date(),
    });

    console.log("Evaluation result saved successfully.");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getEvaluationHistory = async (userId: string) => {
  try {
    const q = query(
      collection(db, "evaluations"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map((doc) => doc.data());
    console.log("Fetched evaluation history:", history);
    return history;
  } catch (e) {
    console.error("Error getting document: ", e);
    return [];
  }
};
