"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Speak = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [speakTime, setSpeakTime] = useState<number>(0);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  useEffect(() => {
    const speakTimeParam = searchParams.get("speakTime");
    const themeParam = searchParams.get("theme");
    if (speakTimeParam) setSpeakTime(parseInt(speakTimeParam, 10));
    if (themeParam) setTheme(themeParam);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const recognition = new (
        window as any
      ).webkitSpeechRecognition() as SpeechRecognition;
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      setRecognition(recognition);
    }
  }, []);

  useEffect(() => {
    if (!recognition) return;
    if (speaking) {
      recognition.start();
    } else {
      recognition.stop();
      setText("");
    }
  }, [speaking, recognition]);

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        if (results[i].isFinal) {
          setText(
            (prevText) => prevText + " " + results[i][0].transcript + "."
          );
          setTranscript("");
        } else {
          setTranscript(results[i][0].transcript);
        }
      }
    };
  }, [recognition]);

  useEffect(() => {
    if (speakTime > 0) {
      const timer = setTimeout(() => setSpeakTime(speakTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (speakTime === 0 && speaking) {
      if (recognition) {
        recognition.stop();
      }
      const query = new URLSearchParams({
        theme: theme,
        transcript: text,
      }).toString();
      console.log("Navigating to evaluation with query:", query);
      router.push(`/evaluation?${query}`);
    }
  }, [speakTime, speaking, text, theme, recognition, router]);

  const startRecording = () => {
    setSpeaking(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-6xl font-bold">
        {speakTime > 0 ? speakTime : "Time's up!"}
      </div>
      {speakTime > 0 && (
        <button
          onClick={() => setSpeakTime(0)}
          className="mt-8 px-4 py-2 bg-red-500 text-white rounded"
        >
          End Speaking
        </button>
      )}
      {speakTime === 0 && !speaking && (
        <button
          onClick={startRecording}
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start Speaking
        </button>
      )}
      <div>
        <p>Interim Transcript: {transcript}</p>
        <p>Final Transcript: {text}</p>
      </div>
    </div>
  );
};

export default Speak;
