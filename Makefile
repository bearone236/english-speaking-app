PROJECT_ID=kpu-cpp-project
REGION=asia-northeast1

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
		--project $(PROJECT_ID)

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
		--project $(PROJECT_ID)

backend: backend-build backend-push backend-deploy

# 全体のデプロイ
deploy: frontend backend
