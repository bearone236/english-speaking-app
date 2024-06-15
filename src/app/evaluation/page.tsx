"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Evaluation = () => {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    const transcriptParam = searchParams.get("transcript");
    console.log("Received theme:", themeParam);
    console.log("Received transcript:", transcriptParam);
    if (themeParam) setTheme(themeParam);
    if (transcriptParam) setTranscript(transcriptParam);
  }, [searchParams]);

  const handleEvaluateClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme, transcript }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setEvaluation(data.evaluation);
    } catch (error) {
      console.error("Request failed:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {theme && (
        <div className="text-2xl font-bold mb-4">
          <h2>Theme:</h2>
          <p>{theme}</p>
        </div>
      )}
      {transcript && (
        <div className="text-2xl font-bold mb-4">
          <h2>Your Speech:</h2>
          <p>{transcript}</p>
        </div>
      )}
      {transcript && !evaluation && (
        <button
          onClick={handleEvaluateClick}
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isLoading ? "Evaluating..." : "Start Evaluation"}
        </button>
      )}
      {evaluation && (
        <div className="mt-4 p-4 bg-white shadow-md rounded">
          <h2 className="text-2xl font-bold">Evaluation:</h2>
          <p>{evaluation}</p>
        </div>
      )}
    </div>
  );
};

export default Evaluation;
