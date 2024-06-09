package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/gemini", handleTheme)
	mux.HandleFunc("/api/evaluate", handleEvaluate)

	handler := cors.Default().Handler(mux)

	log.Println("Server is starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
