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
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      if (auth.currentUser) {
        const userHistory = await getEvaluationHistory(auth.currentUser.uid);
        userHistory.sort(
          (a: any, b: any) => b.timestamp.seconds - a.timestamp.seconds
        );
        setHistory(userHistory);
      } else {
        router.push("/");
      }
      setLoading(false);
    };

    fetchHistory();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Evaluation History</h2>
      {history.length > 0 ? (
        <Accordion type="single" collapsible className="w-full max-w-3xl">
          {history.map((entry, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="bg-orange-200 hover:bg-orange-300 p-2 rounded">
                {new Date(entry.timestamp.seconds * 1000).toLocaleString(
                  "ja-JP",
                  {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                  }
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-orange-100 rounded shadow-sm space-y-6">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">【テーマ】</span>
                    <span className="text-gray-700">{entry.theme}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">【レベル】</span>
                    <span className="text-gray-700">{entry.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">【シンキングタイム】</span>
                    <span className="text-gray-700">{entry.thinkTime} 秒</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">【スピーキングタイム】</span>
                    <span className="text-gray-700">{entry.speakTime} 秒</span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className="font-bold">【あなたの結果】</span>
                    <p className="text-gray-700 bg-white p-2 rounded">
                      {entry.transcript}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className="font-bold">【評価】</span>
                    <div className="text-gray-700 bg-white p-2 rounded prose">
                      <ReactMarkdown>{entry.evaluation}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p>No evaluation history found.</p>
      )}
      <Button
        onClick={() => router.push("/")}
        className="mt-8 bg-orange-500 hover:bg-orange-600 text-white"
      >
        Home
      </Button>
    </div>
  );
};

export default History;
