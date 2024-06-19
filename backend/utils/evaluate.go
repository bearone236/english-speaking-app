package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

type EvaluationClient struct {
	APIKey string
	APIURL string
}

func InitializeEvaluationClient() *EvaluationClient {
	return &EvaluationClient{
		APIKey: os.Getenv("GEMINI_API_KEY"),
		APIURL: os.Getenv("GEMINI_API_URL"),
	}
}

func (client *EvaluationClient) EvaluateContent(ctx context.Context, prompt, transcript string) (string, error) {
	url := client.APIURL + "?key=" + client.APIKey

	requestBody, err := json.Marshal(map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": fmt.Sprintf("あなたは優秀な英会話の評価者です。今回与えられたテーマとユーザーのスピーチ内容を元に詳細な評価を行ってください。曖昧になってしまっている表現に関しては良い表現を提示してあげてください。最後に修正した文章を表示してください。\n\n テーマ: %s \n\n スピーチ内容: %s", prompt, transcript)},
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

	// Handle the unexpected response format
	evaluation, err := extractEvaluation(result)
	if err != nil {
		return "", fmt.Errorf("unexpected response format: %v", result)
	}

	return evaluation, nil
}

func extractEvaluation(result map[string]interface{}) (string, error) {
	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "", fmt.Errorf("candidates not found")
	}

	firstCandidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid candidate format")
	}

	content, ok := firstCandidate["content"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("content not found")
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return "", fmt.Errorf("parts not found")
	}

	text, ok := parts[0].(map[string]interface{})["text"].(string)
	if !ok {
		return "", fmt.Errorf("text not found")
	}

	return text, nil
}

func HandleEvaluate(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Prompt     string `json:"prompt"`
		Transcript string `json:"transcript"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	client := InitializeEvaluationClient()

	message, err := client.EvaluateContent(context.Background(), requestData.Prompt, requestData.Transcript)
	if err != nil {
		log.Printf("Gemini API error: %v", err)
		http.Error(w, fmt.Sprintf("Gemini API error: %v", err), http.StatusInternalServerError)
		return
	}

	responseData := map[string]string{"evaluation": message}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responseData)
}
