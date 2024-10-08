"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const Home = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [selectedThinkTime, setSelectedThinkTime] = useState<string>("");
  const [thinkTime, setThinkTime] = useState<string>("");
  const [selectedSpeakTime, setSelectedSpeakTime] = useState<string>("");
  const [speakTime, setSpeakTime] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!selectedTheme) newErrors.selectedTheme = "Theme is not selected";
    if (selectedTheme === "specify" && !theme)
      newErrors.theme = "Please enter a theme";
    if (!selectedThinkTime)
      newErrors.selectedThinkTime = "Think time is not selected";
    if (selectedThinkTime === "custom-think" && !thinkTime)
      newErrors.thinkTime = "Please enter think time";
    if (!selectedSpeakTime)
      newErrors.selectedSpeakTime = "Speak time is not selected";
    if (selectedSpeakTime === "custom-speak" && !speakTime)
      newErrors.speakTime = "Please enter speak time";
    if (!selectedLevel) newErrors.selectedLevel = "Level is not selected";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartClick = async () => {
    if (validate()) {
      setLoading(true);

      const prompt_post = selectedTheme === "random" ? "random" : theme;
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      try {
        const response = await fetch(`${apiBaseUrl}/api/gemini`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: prompt_post }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        const effectiveThinkTime =
          selectedThinkTime === "custom-think" ? thinkTime : selectedThinkTime;
        const effectiveSpeakTime =
          selectedSpeakTime === "custom-speak" ? speakTime : selectedSpeakTime;

        const href = `/thinking?theme=${data.message}&thinkTime=${effectiveThinkTime}&speakTime=${effectiveSpeakTime}&level=${selectedLevel}`;
        router.push(href);
        setLoading(false);
      } catch (error) {
        console.error("Request failed:", error);
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <main className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8 bg-white shadow-md rounded-lg pt-20">
          <div className="space-y-8 pl-20">
            <div className="flex items-start space-x-4">
              <h3 className="w-1/5 text-right font-medium flex items-center">
                Theme
              </h3>
              <div className="flex-grow flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <Select onValueChange={(value) => setSelectedTheme(value)}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random Theme</SelectItem>
                      <SelectItem value="specify">Specify Theme</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    className="w-[250px]"
                    placeholder="Enter a theme"
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

            <div className="flex items-start space-x-4">
              <h3 className="w-1/5 text-right font-medium flex items-center">
                Think Time
              </h3>
              <div className="flex-grow flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <Select
                    onValueChange={(value) => setSelectedThinkTime(value)}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                      <SelectItem value="custom-think">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    className="w-[250px]"
                    placeholder="Enter time"
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

            <div className="flex items-start space-x-4">
              <h3 className="w-1/5 text-right font-medium flex items-center">
                Speak Time
              </h3>
              <div className="flex-grow flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <Select
                    onValueChange={(value) => setSelectedSpeakTime(value)}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60 seconds</SelectItem>
                      <SelectItem value="120">120 seconds</SelectItem>
                      <SelectItem value="180">180 seconds</SelectItem>
                      <SelectItem value="custom-speak">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    className="w-[250px]"
                    placeholder="Enter time"
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

            <div className="flex items-start space-x-4">
              <h3 className="w-1/5 text-right font-medium flex items-center">
                Level
              </h3>
              <div className="flex-grow flex flex-col space-y-2">
                <Select onValueChange={(value) => setSelectedLevel(value)}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-5">
                  {errors.selectedLevel && (
                    <p className="text-red-500">{errors.selectedLevel}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleStartClick} disabled={loading}>
              {loading ? "Loading..." : "Start"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
