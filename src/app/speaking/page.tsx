"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Speak = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [speakTime, setSpeakTime] = useState<number>(0);
  const [initialSpeakTime, setInitialSpeakTime] = useState<number>(0);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [thinkTime, setThinkTime] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  useEffect(() => {
    const speakTimeParam = searchParams.get("speakTime");
    const themeParam = searchParams.get("theme");
    const thinkTimeParam = searchParams.get("thinkTime");
    const levelParam = searchParams.get("level");

    if (speakTimeParam) {
      const speakTimeValue = parseInt(speakTimeParam, 10);
      setSpeakTime(speakTimeValue);
      setInitialSpeakTime(speakTimeValue);
    }
    if (themeParam) setTheme(themeParam);
    if (thinkTimeParam) setThinkTime(thinkTimeParam);
    if (levelParam) setLevel(levelParam);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined" && !recognition) {
      const newRecognition = new (
        window as any
      ).webkitSpeechRecognition() as SpeechRecognition;
      newRecognition.lang = "en-US";
      newRecognition.continuous = true;
      newRecognition.interimResults = true;

      newRecognition.onstart = () => {
        console.log("Speech recognition service has started");
      };

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
        if (event.error === "no-speech") {
          console.warn("No speech detected. Please speak into the microphone.");
          setError("no-speech");
        }
        setSpeaking(false);
      };

      newRecognition.onend = () => {
        console.log("Speech recognition service disconnected");
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
      if (text.trim() === "") {
        setError("no-speech");
      }
      const query = new URLSearchParams({
        theme: theme,
        transcript: text,
        error: text.trim() === "" ? "true" : "false",
        speakTime: initialSpeakTime.toString(),
        thinkTime: thinkTime || "0",
        level: level || "",
      }).toString();
      router.push(`/result?${query}`);
    }
  }, [
    speakTime,
    speaking,
    text,
    theme,
    error,
    recognition,
    router,
    initialSpeakTime,
    thinkTime,
    level,
  ]);

  useEffect(() => {
    if (speakTime > 0) {
      setSpeaking(true);
    }
  }, [speakTime]);

  const handleEndSpeaking = () => {
    setError("no-speech");
    setSpeakTime(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-6xl font-bold">
        {speakTime > 0 ? speakTime : "Time's up!"}
      </div>
      {speakTime > 0 && (
        <button
          onClick={handleEndSpeaking}
          className="mt-8 px-4 py-2 bg-red-500 text-white rounded"
        >
          End Speaking
        </button>
      )}
      <div></div>
    </div>
  );
};

export default Speak;
