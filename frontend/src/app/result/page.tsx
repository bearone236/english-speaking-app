"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { saveEvaluationResult } from "@/lib/firestore";

const Result = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [theme, setTheme] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [speakTime, setSpeakTime] = useState<number>(0);
  const [thinkTime, setThinkTime] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [retryAllowed, setRetryAllowed] = useState<boolean>(true);

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    const transcriptParam = searchParams.get("transcript");
    const errorParam = searchParams.get("error");
    const speakTimeParam = searchParams.get("speakTime");
    const thinkTimeParam = searchParams.get("thinkTime");
    const levelParam = searchParams.get("level");

    if (themeParam) setTheme(themeParam);
    if (transcriptParam) setTranscript(transcriptParam);
    if (errorParam === "true")
      setError("No speech detected or an error occurred.");
    if (speakTimeParam) setSpeakTime(parseInt(speakTimeParam, 10));
    if (thinkTimeParam) setThinkTime(thinkTimeParam);
    if (levelParam) setLevel(levelParam);
  }, [searchParams]);

  const handleEvaluateClick = async () => {
    if (!theme || !transcript) {
      setError("No speech detected or an error occurred. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: theme, transcript }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.evaluation) {
        if (auth.currentUser) {
          await saveEvaluationResult(
            auth.currentUser.uid,
            theme,
            transcript,
            data.evaluation,
            thinkTime || "0",
            speakTime.toString(),
            level || ""
          );
        }
        const query = new URLSearchParams({
          theme: theme,
          transcript: transcript,
          evaluation: data.evaluation,
          thinkTime: thinkTime || "0",
          speakTime: speakTime.toString(),
          level: level || "",
        }).toString();
        router.push(`/evaluation?${query}`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setError("No speech detected or an error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRetrySpeaking = () => {
    setRetryAllowed(false);

    const query = new URLSearchParams({
      theme: theme || "",
      speakTime: speakTime.toString(),
      thinkTime: thinkTime || "0",
      level: level || "",
    }).toString();
    router.push(`/speaking?${query}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {!error && theme && (
        <div className="w-full max-w-xl p-6 mb-4 bg-orange-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-orange-600">Theme:</h2>
          <p className="text-xl text-gray-700 mt-2">{theme}</p>
        </div>
      )}
      {transcript && !error && (
        <div className="w-full max-w-xl p-6 mb-4 bg-orange-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-orange-600">Your Speech:</h2>
          <p className="text-xl text-gray-700 mt-2 whitespace-pre-wrap">
            {transcript}
          </p>
        </div>
      )}
      {error && (
        <div className="text-2xl font-bold mb-4 text-red-500">
          <h2>Error:</h2>
          <p>{error}</p>
          {retryAllowed && (
            <button
              onClick={handleRetrySpeaking}
              className="mt-8 px-4 py-2 bg-orange-500 text-white rounded"
            >
              Retry Speaking
            </button>
          )}
        </div>
      )}
      {transcript && !error && (
        <button
          onClick={handleEvaluateClick}
          className="mt-8 px-4 py-2 bg-orange-500 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? "Evaluating..." : "Start Evaluation"}
        </button>
      )}
    </div>
  );
};

export default Result;
