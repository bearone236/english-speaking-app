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
    if (typeof window !== "undefined" && !recognition) {
      const newRecognition = new (
        window as any
      ).webkitSpeechRecognition() as SpeechRecognition;
      newRecognition.lang = "en-US";
      newRecognition.continuous = true;
      newRecognition.interimResults = true;

      newRecognition.onresult = (event) => {
        const results = event.results;
        let interimTranscript = "";
        for (let i = event.resultIndex; i < results.length; i++) {
          if (results[i].isFinal) {
            setText(
              (prevText) => prevText + " " + results[i][0].transcript + "."
            );
            setTranscript("");
          } else {
            interimTranscript += results[i][0].transcript;
          }
        }
        setTranscript(interimTranscript);
      };

      newRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setSpeaking(false);
      };

      newRecognition.onend = () => {
        if (speakTime > 0) {
          newRecognition.start();
        } else {
          setSpeaking(false);
        }
      };

      setRecognition(newRecognition);
    }
  }, [recognition, speakTime]);

  useEffect(() => {
    if (recognition && speaking) {
      recognition.start();
      console.log("Speech recognition started");
    } else if (recognition) {
      recognition.stop();
      setText("");
      console.log("Speech recognition stopped");
    }
  }, [speaking, recognition]);

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

  useEffect(() => {
    if (speakTime > 0) {
      setSpeaking(true);
    }
  }, [speakTime]);

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
      <div>
        <p>Interim Transcript: {transcript}</p>
        <p>Final Transcript: {text}</p>
      </div>
    </div>
  );
};

export default Speak;
