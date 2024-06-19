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
    if (levelParam) setLevel(levelParam);

    if (
      auth.currentUser &&
      themeParam &&
      transcriptParam &&
      evaluationParam &&
      thinkTimeParam &&
      speakTimeParam &&
      levelParam
    ) {
      saveEvaluationResult(
        auth.currentUser.uid,
        themeParam,
        transcriptParam,
        evaluationParam,
        thinkTimeParam,
        speakTimeParam,
        levelParam
      );
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {theme && (
        <div className="w-full max-w-4xl p-6 mb-4 bg-orange-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-orange-600">テーマ:</h2>
          <p className="text-xl text-gray-700 mt-2">{theme}</p>
        </div>
      )}

      {transcript && (
        <div className="w-full max-w-4xl p-6 mb-4 bg-orange-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-orange-600">
            あなたのスピーチ内容:
          </h2>
          <p className="text-xl text-gray-700 mt-2 whitespace-pre-wrap">
            {transcript}
          </p>
        </div>
      )}
      {evaluation && (
        <div className="w-full max-w-6xl p-6 mt-8 bg-white shadow-md rounded-lg">
          {/* <h2 className="text-2xl font-bold text-orange-600 mb-4">
            Evaluation Result:
          </h2> */}
          <div
            className="text-gray-800 text-lg"
            dangerouslySetInnerHTML={{ __html: marked(evaluation || "") }}
          />
        </div>
      )}
    </div>
  );
};

export default Evaluation;
