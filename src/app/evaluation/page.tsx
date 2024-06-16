"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { marked } from "marked";
import { saveEvaluationResult } from "@/lib/firestore";
import { auth } from "@/lib/firebaseConfig";

const Evaluation = () => {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [thinkTime, setThinkTime] = useState<string | null>(null);
  const [speakTime, setSpeakTime] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    const transcriptParam = searchParams.get("transcript");
    const evaluationParam = searchParams.get("evaluation");
    const thinkTimeParam = searchParams.get("thinkTime");
    const speakTimeParam = searchParams.get("speakTime");
    const levelParam = searchParams.get("level");

    if (themeParam) setTheme(themeParam);
    if (transcriptParam) setTranscript(transcriptParam);
    if (evaluationParam) setEvaluation(evaluationParam);
    if (thinkTimeParam) setThinkTime(thinkTimeParam);
    if (speakTimeParam) setSpeakTime(speakTimeParam);
    if (levelParam) setLevel(levelParam);

    const saveResult = async () => {
      if (
        auth.currentUser &&
        themeParam &&
        transcriptParam &&
        evaluationParam &&
        thinkTimeParam &&
        speakTimeParam &&
        levelParam
      ) {
        await saveEvaluationResult(
          auth.currentUser.uid,
          themeParam,
          transcriptParam,
          evaluationParam,
          thinkTimeParam,
          speakTimeParam,
          levelParam,
          true
        );
      }
    };

    saveResult();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {theme && (
        <div className="text-2xl font-bold mb-4">
          <h2>テーマ:</h2>
          <p>{theme}</p>
        </div>
      )}
      {transcript && (
        <div className="text-2xl font-bold mb-4">
          <h2>あなたのスピーチ内容:</h2>
          <p>{transcript}</p>
        </div>
      )}
      {evaluation && (
        <div className="mt-8 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Evaluation Result:</h2>
          <div
            className="text-gray-800"
            dangerouslySetInnerHTML={{ __html: marked(evaluation || "") }}
          />
        </div>
      )}
    </div>
  );
};

export default Evaluation;
