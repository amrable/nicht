.PHONY: help install install-api install-web dev dev-api dev-web build build-api build-web typecheck clean env deploy deploy-api deploy-web logs-api db-rows db-rows-remote

# --- Deployment config ---
SSH_KEY   ?= $(HOME)/.ssh/id_ed25519_hetzner
SSH_HOST  ?= root@89.167.12.249
REMOTE    ?= /srv/nicht/app
CF_PROJECT?= nicht-wtf
API_URL   ?= https://api.satzbau.eu
GOOGLE_CLIENT_ID ?= 626851268973-7fejh7pcni1tdkot948o6jf2n3r1i96m.apps.googleusercontent.com

help:
	@echo "Targets:"
	@echo "  make install     Install deps for api and web"
	@echo "  make env         Create .env files from .env.example (if missing)"
	@echo "  make dev         Run api and web together"
	@echo "  make dev-api     Run backend only (http://localhost:3001)"
	@echo "  make dev-web     Run frontend only (http://localhost:5173)"
	@echo "  make build       Build api and web"
	@echo "  make typecheck   Typecheck both"
	@echo "  make clean       Remove node_modules and build output"
	@echo "  make deploy      Deploy api (Hetzner) and web (Cloudflare Pages)"
	@echo "  make deploy-api  Rsync + rebuild + restart nicht-api on Hetzner"
	@echo "  make deploy-web  Build web with prod API URL and deploy to CF Pages"
	@echo "  make logs-api    Tail nicht-api journal on the server"

install: install-api install-web

install-api:
	cd api && npm install

install-web:
	cd web && npm install

env:
	@test -f api/.env || (cp api/.env.example api/.env && echo "created api/.env — fill in OPENROUTER_API_KEY")
	@test -f web/.env || (cp web/.env.example web/.env && echo "created web/.env")

dev:
	@echo "Starting api (:3001) and web (:5173). Ctrl+C stops both."
	@trap 'kill 0' INT TERM EXIT; \
		(cd api && npm run dev) & \
		(cd web && npm run dev) & \
		wait

dev-api:
	cd api && npm run dev

dev-web:
	cd web && npm run dev

build: build-api build-web

build-api:
	cd api && npm run build

build-web:
	cd web && npm run build

typecheck:
	cd api && npm run typecheck
	cd web && npm run typecheck

clean:
	rm -rf api/node_modules api/dist web/node_modules web/dist

# --- Deploy ---

deploy: deploy-api deploy-web
	@echo "✓ deployed api + web"

deploy-api:
	@echo "→ syncing api/ to $(SSH_HOST):$(REMOTE)"
	rsync -az --delete \
		-e "ssh -i $(SSH_KEY)" \
		--exclude node_modules --exclude dist --exclude .env --exclude data \
		api/ $(SSH_HOST):$(REMOTE)/
	@echo "→ installing deps, building, restarting service"
	ssh -i $(SSH_KEY) $(SSH_HOST) '\
		cd $(REMOTE) && \
		chown -R nicht:nicht . && \
		sudo -u nicht npm ci --include=dev --no-audit --no-fund >/dev/null && \
		sudo -u nicht npm run build && \
		systemctl restart nicht-api && \
		systemctl is-active nicht-api'
	@echo "→ health check"
	@for i in 1 2 3 4 5; do \
		if curl -fsS --max-time 5 $(API_URL)/api/health >/dev/null; then \
			echo "  ok"; exit 0; \
		fi; \
		sleep 1; \
	done; \
	echo "  health check failed"; exit 1

deploy-web:
	@echo "→ building web with VITE_API_URL=$(API_URL)"
	cd web && VITE_API_URL=$(API_URL) VITE_GOOGLE_CLIENT_ID=$(GOOGLE_CLIENT_ID) npm run build
	@echo "→ deploying to Cloudflare Pages project '$(CF_PROJECT)'"
	cd web && npx --yes wrangler pages deploy dist \
		--project-name $(CF_PROJECT) \
		--branch main \
		--commit-dirty=true

logs-api:
	ssh -i $(SSH_KEY) $(SSH_HOST) 'journalctl -u nicht-api -f -n 500'

# --- DB inspection ---
# Show latest N rows of the analyses table. Override N and DB path:
#   make db-rows N=50
#   make db-rows-remote N=20
N       ?= 20
DB      ?= api/data/analyses.db
REMOTE_DB ?= $(REMOTE)/data/analyses.db

db-rows:
	@sqlite3 -header -column $(DB) \
		"SELECT id, datetime(created_at, 'unixepoch', 'localtime') AS created, substr(sentence, 1, 80) AS sentence FROM analyses ORDER BY created_at DESC LIMIT $(N);"

db-rows-remote:
	@ssh -i $(SSH_KEY) $(SSH_HOST) "sqlite3 -header -column $(REMOTE_DB) \"SELECT id, datetime(created_at, 'unixepoch', 'localtime') AS created, substr(sentence, 1, 80) AS sentence FROM analyses ORDER BY created_at DESC LIMIT $(N);\""
