"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Think = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [theme, setTheme] = useState<string | null>(null);
  const [thinkTime, setThinkTime] = useState<number | null>(null);
  const [speakTime, setSpeakTime] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(true);

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    const thinkTimeParam = searchParams.get("thinkTime");
    const speakTimeParam = searchParams.get("speakTime");
    const levelParam = searchParams.get("level");

    if (themeParam) setTheme(themeParam);
    if (thinkTimeParam) setThinkTime(parseInt(thinkTimeParam, 10));
    if (speakTimeParam) setSpeakTime(parseInt(speakTimeParam, 10));
    if (levelParam) setLevel(levelParam);
  }, [searchParams]);

  useEffect(() => {
    if (thinkTime === null) return;

    if (thinkTime > 0) {
      const timer = setTimeout(() => setThinkTime(thinkTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowInfo(false);
      setCountdown(5);
    }
  }, [thinkTime]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (theme && speakTime !== null) {
        const query = new URLSearchParams({
          theme,
          speakTime: speakTime.toString(),
        }).toString();
        router.push(`/speaking?${query}`);
      }
    }
  }, [countdown, router, theme, speakTime]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "High":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {showInfo && (
        <div className="flex items-center space-x-4 mb-4">
          {level && (
            <div
              className={`w-16 h-16 flex items-center justify-center text-white font-bold ${getLevelColor(
                level
              )}`}
            >
              {level}
            </div>
          )}
          {theme && (
            <h1
              className="text-3xl font-bold select-none"
              style={{ userSelect: "none" }}
            >
              {theme}
            </h1>
          )}
        </div>
      )}
      <div className="text-6xl font-bold">
        {thinkTime !== null && thinkTime > 0 ? thinkTime : "Time's up!"}
      </div>
      {countdown !== null && countdown > 0 && (
        <div className="text-2xl font-bold mt-4">
          Moving to Speaking in {countdown}s
        </div>
      )}
    </div>
  );
};

export default Think;
