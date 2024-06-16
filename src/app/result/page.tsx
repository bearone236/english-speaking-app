"use client";
import { auth } from "@/lib/firebaseConfig";
import { saveEvaluationResult } from "@/lib/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      const response = await fetch("http://localhost:8080/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: theme, transcript }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      if (data && data.evaluation) {
        if (auth.currentUser) {
          await saveEvaluationResult(
            auth.currentUser.uid,
            theme,
            transcript,
            data.evaluation
          );
        }

        const query = new URLSearchParams({
          theme,
          transcript,
          evaluation: data.evaluation,
          thinkTime: thinkTime || "",
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
    if (retryAllowed) {
      setRetryAllowed(false);
      const query = new URLSearchParams({
        theme: theme || "",
        speakTime: speakTime.toString(),
        thinkTime: thinkTime || "",
        level: level || "",
      }).toString();
      router.push(`/speaking?${query}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!error && theme && (
        <div className="text-2xl font-bold mb-4">
          <h2>Theme:</h2>
          <p>{theme}</p>
        </div>
      )}
      {transcript && !error && (
        <div className="text-2xl font-bold mb-4">
          <h2>Your Speech:</h2>
          <p>{transcript}</p>
        </div>
      )}
      {error && (
        <div className="text-2xl font-bold mb-4 text-red-500">
          <h2>Error:</h2>
          <p>{error}</p>
          <button
            onClick={handleRetrySpeaking}
            className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
            disabled={!retryAllowed}
          >
            Retry Speaking
          </button>
        </div>
      )}
      {transcript && !error && (
        <button
          onClick={handleEvaluateClick}
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? "Evaluating..." : "Start Evaluation"}
        </button>
      )}
    </div>
  );
};

export default Result;
