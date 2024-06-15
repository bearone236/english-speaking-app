package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

type GeminiClient struct {
	APIKey string
	APIURL string
}

func InitializeGeminiClient() *GeminiClient {
	return &GeminiClient{
		APIKey: os.Getenv("GEMINI_API_KEY"),
		APIURL: os.Getenv("GEMINI_API_URL"),
	}
}

func (client *GeminiClient) GenerateContent(ctx context.Context, prompt string) (string, error) {
	url := client.APIURL + "?key=" + client.APIKey

	requestBody, err := json.Marshal(map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": prompt},
				},
			},
		},
	})
	if err != nil {
		return "", fmt.Errorf("error marshaling request body: %v", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making API request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		return "", fmt.Errorf("Gemini API error: %s", string(bodyBytes))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("error decoding API response: %v", err)
	}

	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "", fmt.Errorf("unexpected response format: %v", result)
	}

	firstCandidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("unexpected response format: %v", result)
	}

	content, ok := firstCandidate["content"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("unexpected response format: %v", result)
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return "", fmt.Errorf("unexpected response format: %v", result)
	}

	text, ok := parts[0].(map[string]interface{})["text"].(string)
	if !ok {
		return "", fmt.Errorf("unexpected response format: %v", result)
	}

	return text, nil
}

func generatePrompt(customTheme, level string) string {
	levelDescription := ""
	switch level {
	case "Low":
		levelDescription = "This level is suitable for beginners. The questions should be simple, using basic vocabulary and grammar. Aim to create questions that are easy to understand and answer for those with limited English proficiency."
	case "Medium":
		levelDescription = "This level is suitable for intermediate learners. The questions should use more complex sentences and vocabulary. Aim to create questions that challenge the learner to form more detailed and nuanced responses."
	case "High":
		levelDescription = "This level is suitable for advanced learners. The questions should use advanced vocabulary and complex sentence structures. Aim to create questions that require critical thinking and articulate, detailed responses."
	default:
		levelDescription = "The questions should be designed to elicit detailed responses and stimulate discussion on topics such as opinions, priorities, and values. Please ensure the questions are varied and cover different aspects each time."
	}

	if customTheme == "random" {
		return fmt.Sprintf(`Generate a single English question at a %s level. %s The question should be designed to elicit detailed responses and stimulate discussion on topics such as opinions, priorities, and values. Please ensure the questions are varied and cover different aspects each time.`, level, levelDescription)
	}
	return fmt.Sprintf(`Generate a single English question at a %s level, focusing on the following theme: "%s". %s The question should encourage meaningful conversation, elicit detailed responses, and stimulate discussion on topics such as opinions, priorities, and values. Please ensure the questions are varied and cover different aspects each time.`, level, customTheme, levelDescription)
}

func HandleTheme(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Prompt string `json:"prompt"`
		Level  string `json:"level"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	client := InitializeGeminiClient()
	prompt := generatePrompt(requestData.Prompt, requestData.Level)

	message, err := client.GenerateContent(context.Background(), prompt)
	if err != nil {
		http.Error(w, fmt.Sprintf("Gemini API error: %v", err), http.StatusInternalServerError)
		return
	}

	question := strings.SplitN(message, "\n", 2)[0]

	responseData := map[string]string{"message": question}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responseData)
}
