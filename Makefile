.PHONY: help install install-api install-web dev dev-api dev-web build build-api build-web typecheck clean env deploy deploy-api deploy-web logs-api

# --- Deployment config ---
SSH_KEY   ?= $(HOME)/.ssh/id_ed25519_hetzner
SSH_HOST  ?= root@89.167.12.249
REMOTE    ?= /srv/nicht/app
CF_PROJECT?= nicht-wtf
API_URL   ?= https://api.nicht.wtf

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
	cd web && VITE_API_URL=$(API_URL) npm run build
	@echo "→ deploying to Cloudflare Pages project '$(CF_PROJECT)'"
	cd web && npx --yes wrangler pages deploy dist \
		--project-name $(CF_PROJECT) \
		--branch main \
		--commit-dirty=true

logs-api:
	ssh -i $(SSH_KEY) $(SSH_HOST) 'journalctl -u nicht-api -f -n 500'
