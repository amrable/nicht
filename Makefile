.PHONY: help install install-api install-web dev dev-api dev-web build build-api build-web typecheck clean env

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
