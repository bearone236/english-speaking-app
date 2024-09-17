package main

import (
	"log"
	"net/http"
	"os"

	"backend/utils"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		log.Fatalf("FRONTEND_URL is not set in the environment variables")
	}

	corsOptions := cors.Options{
		AllowedOrigins:   []string{frontendURL},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/gemini", utils.HandleTheme)
	mux.HandleFunc("/api/evaluate", utils.HandleEvaluate)

	handler := cors.New(corsOptions).Handler(mux)

	log.Println("Server is starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
