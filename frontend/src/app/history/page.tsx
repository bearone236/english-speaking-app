"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvaluationHistory } from "@/lib/firestore";
import { auth } from "@/lib/firebaseConfig";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      if (auth.currentUser) {
        const userHistory = await getEvaluationHistory(auth.currentUser.uid);
        setHistory(userHistory);
      } else {
        router.push("/");
      }
      setLoading(false);
    };

    fetchHistory();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Evaluation History</h2>
      {history.length > 0 ? (
        <Accordion type="single" collapsible>
          {history.map((entry, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>
                {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  <strong>Theme:</strong> {entry.theme}
                </p>
                <p>
                  <strong>Transcript:</strong> {entry.transcript}
                </p>
                <p>
                  <strong>Evaluation:</strong> {entry.evaluation}
                </p>
                <p>
                  <strong>Think Time:</strong> {entry.thinkTime} seconds
                </p>
                <p>
                  <strong>Speak Time:</strong> {entry.speakTime} seconds
                </p>
                <p>
                  <strong>Level:</strong> {entry.level}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p>No evaluation history found.</p>
      )}
      <button
        onClick={() => router.push("/")}
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Home
      </button>
    </div>
  );
};

export default History;
