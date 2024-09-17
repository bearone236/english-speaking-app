FROM golang:1.20

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV GEMINI_API_URL=${GEMINI_API_URL}

RUN go build -o main .

CMD ["./main"]
