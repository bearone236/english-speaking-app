export PROJECT_ID=kpu-cpp-project
export REGION=asia-northeast1

# Load environment variables from .env files
ifneq (,$(wildcard .env))
export $(shell grep -v '^#' .env | xargs)
endif

# frontend
frontend-build:
	docker build -t gcr.io/$(PROJECT_ID)/frontend-service ./frontend

frontend-push:
	docker push gcr.io/$(PROJECT_ID)/frontend-service

frontend-deploy:
	gcloud run deploy frontend-service \
		--image gcr.io/$(PROJECT_ID)/frontend-service \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--project $(PROJECT_ID) \
		--set-env-vars \
			NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY},\
			NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN},\
			NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID},\
			NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET},\
			NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID},\
			NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID},\
			NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}

frontend: frontend-build frontend-push frontend-deploy

# backend
backend-build:
	docker build -t gcr.io/$(PROJECT_ID)/backend-service ./backend

backend-push:
	docker push gcr.io/$(PROJECT_ID)/backend-service

backend-deploy:
	gcloud run deploy backend-service \
		--image gcr.io/$(PROJECT_ID)/backend-service \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--project $(PROJECT_ID) \
		--set-env-vars \
			GEMINI_API_KEY=${GEMINI_API_KEY},\
			GEMINI_API_URL=${GEMINI_API_URL}

backend: backend-build backend-push backend-deploy

# 全体のデプロイ
deploy: frontend backend