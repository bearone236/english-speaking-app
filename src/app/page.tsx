"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import * as z from "zod";

const schema = z.object({
  selectedTheme: z.string().min(1, "テーマが選択されていません"),
  theme: z.string().optional(),
  selectedThinkTime: z.string().min(1, "シンキングタイムが選択されていません"),
  thinkTime: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: "シンキングタイムは数値でなければなりません",
    })
    .optional(),
  selectedSpeakTime: z
    .string()
    .min(1, "スピーキングタイムが選択されていません"),
  speakTime: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: "スピーキングタイムは数値でなければなりません",
    })
    .optional(),
});

type SchemaType = z.infer<typeof schema>;

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [selectedThinkTime, setSelectedThinkTime] = useState<string>("");
  const [thinkTime, setThinkTime] = useState<string>("");
  const [selectedSpeakTime, setSelectedSpeakTime] = useState<string>("");
  const [speakTime, setSpeakTime] = useState<string>("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof SchemaType, string>>
  >({});

  const validate = (): boolean => {
    const result = schema.safeParse({
      selectedTheme,
      theme,
      selectedThinkTime,
      thinkTime,
      selectedSpeakTime,
      speakTime,
    });

    if (!result.success) {
      const newErrors: Partial<Record<keyof SchemaType, string>> = {};
      result.error.errors.forEach((error) => {
        newErrors[error.path[0] as keyof SchemaType] = error.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleStartClick = () => {
    if (validate()) {
      // スタートボタンがクリックされた時の処理
      console.log("スタート");
    }
  };

  return (
    <div>
      <Header />

      <main className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8 bg-white shadow-md rounded-lg pt-20 pb-10">
          <div className="space-y-8">
            <div className="flex items-start space-x-4 pl-20">
              <h3 className="w-1/5 text-right font-medium flex items-center">
                テーマ
              </h3>
              <div className="flex-grow flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <Select onValueChange={(value) => setSelectedTheme(value)}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="テーマを設定してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">ランダムテーマ</SelectItem>
                      <SelectItem value="specify">テーマ指定</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    className="w-[250px]"
                    placeholder="テーマを入力してください"
                    disabled={selectedTheme !== "specify"}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                </div>
                <div className="h-5">
                  {errors.selectedTheme && (
                    <p className="text-red-500">{errors.selectedTheme}</p>
                  )}
                  {errors.theme && selectedTheme === "specify" && (
                    <p className="text-red-500">{errors.theme}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 pl-20">
              <h3 className="w-1/5 text-right font-medium flex items-center">
                シンキングタイム
              </h3>
              <div className="flex-grow flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <Select
                    onValueChange={(value) => setSelectedThinkTime(value)}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="時間を設定してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10s">10秒</SelectItem>
                      <SelectItem value="30s">30秒</SelectItem>
                      <SelectItem value="60s">60秒</SelectItem>
                      <SelectItem value="custom-think">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    className="w-[250px]"
                    placeholder="時間を入力してください"
                    disabled={selectedThinkTime !== "custom-think"}
                    onChange={(e) => setThinkTime(e.target.value)}
                  />
                </div>
                <div className="h-5">
                  {errors.selectedThinkTime && (
                    <p className="text-red-500">{errors.selectedThinkTime}</p>
                  )}
                  {errors.thinkTime && selectedThinkTime === "custom-think" && (
                    <p className="text-red-500">{errors.thinkTime}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 pl-20">
              <h3 className="w-1/5 text-right font-medium flex items-center">
                スピーキングタイム
              </h3>
              <div className="flex-grow flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <Select
                    onValueChange={(value) => setSelectedSpeakTime(value)}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="時間を設定してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60s">60秒</SelectItem>
                      <SelectItem value="120s">120秒</SelectItem>
                      <SelectItem value="180s">180秒</SelectItem>
                      <SelectItem value="custom-speak">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    className="w-[250px]"
                    placeholder="時間を入力してください"
                    disabled={selectedSpeakTime !== "custom-speak"}
                    onChange={(e) => setSpeakTime(e.target.value)}
                  />
                </div>
                <div className="h-5">
                  {errors.selectedSpeakTime && (
                    <p className="text-red-500">{errors.selectedSpeakTime}</p>
                  )}
                  {errors.speakTime && selectedSpeakTime === "custom-speak" && (
                    <p className="text-red-500">{errors.speakTime}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleStartClick}>スタート</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
