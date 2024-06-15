package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
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

func (client *EvaluationClient) EvaluateContent(ctx context.Context, theme, transcript string) (string, error) {
	url := client.APIURL + "?key=" + client.APIKey

	requestBody, err := json.Marshal(map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": fmt.Sprintf("Theme: %s\n\nSpeech: %s\n\nEvaluate the above speech based on the theme and provide feedback on the accuracy and relevance of the response.", theme, transcript)},
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

	evaluation, ok := result["evaluation"].(string)
	if !ok {
		return "", fmt.Errorf("unexpected response format: %v", result)
	}

	return evaluation, nil
}

func HandleEvaluate(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Theme      string `json:"theme"`
		Transcript string `json:"transcript"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	client := InitializeEvaluationClient()

	message, err := client.EvaluateContent(context.Background(), requestData.Theme, requestData.Transcript)
	if err != nil {
		http.Error(w, fmt.Sprintf("Gemini API error: %v", err), http.StatusInternalServerError)
		return
	}

	responseData := map[string]string{"evaluation": message}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responseData)
}
