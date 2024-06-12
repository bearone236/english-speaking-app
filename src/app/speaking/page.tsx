"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Speak = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [speakTime, setSpeakTime] = useState<number>(0);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  let recognition: any;

  useEffect(() => {
    const speakTimeParam = searchParams.get("speakTime");
    const themeParam = searchParams.get("theme");
    if (speakTimeParam) setSpeakTime(parseInt(speakTimeParam, 10));
    if (themeParam) setTheme(themeParam);
  }, [searchParams]);

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
        transcript: transcript,
      }).toString();
      router.push(`/evaluation?${query}`);
    }
  }, [speakTime, speaking, theme, transcript, router]);

  const startRecording = () => {
    setSpeaking(true);
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: { resultIndex: any; results: any }) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript(
            (prevTranscript) =>
              prevTranscript + " " + result[0].transcript + "."
          );
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      console.log("Interim Transcript:", interimTranscript);
    };

    recognition.onerror = (event: { error: any }) => {
      console.error(event.error);
      setSpeaking(false);
    };

    recognition.onend = () => {
      if (speakTime > 0) {
        recognition.start();
      } else {
        setSpeaking(false);
      }
    };

    recognition.start();
  };

  useEffect(() => {
    if (speakTime > 0 && !speaking) {
      startRecording();
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
    </div>
  );
};

export default Speak;
