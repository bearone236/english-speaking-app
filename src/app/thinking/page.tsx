"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Think = () => {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState("");
  const [thinkTime, setThinkTime] = useState("");
  const [speakTime, setSpeakTime] = useState("");

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    const thinkTimeParam = searchParams.get("thinkTime");
    const speakTimeParam = searchParams.get("speakTime");

    if (themeParam) setTheme(themeParam);
    if (thinkTimeParam) setThinkTime(thinkTimeParam);
    if (speakTimeParam) setSpeakTime(speakTimeParam);
  }, [searchParams]);

  return (
    <div>
      <h1>Theme: {theme}</h1>
      <h2>Think Time: {thinkTime} seconds</h2>
      <h2>Speak Time: {speakTime} seconds</h2>
    </div>
  );
};

export default Think;
