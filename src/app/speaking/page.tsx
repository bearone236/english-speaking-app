import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const Speaking = () => {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme");
  const speakTime = Number(searchParams.get("speakTime")) || 60; // デフォルト60秒
  const [seconds, setSeconds] = useState<number>(speakTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      // スピーキングタイム終了後の処理をここに追加
    }
  }, [seconds]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">スピーキングタイム</h1>
      <p className="text-lg mb-4">テーマ: {theme}</p>
      <div className="text-5xl font-bold">{seconds}</div>
    </div>
  );
};

export default Speaking;
