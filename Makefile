.PHONY: dev dev-web dev-server build build-web build-server docker docker-up docker-down help

# ─── 开发命令 ────────────────────────────────────────────────────

## dev: 并行启动前后端开发服务
dev:
	@echo "🚀 启动 GrowPilot 开发环境..."
	@make dev-server & make dev-web

## dev-web: 启动前端开发服务 (port 3003)
dev-web:
	@echo "🌐 启动前端 (http://localhost:3003)..."
	@cd web && npm run dev

## dev-server: 启动 Go 后端开发服务 (port 8080)
dev-server:
	@echo "⚙️  启动后端 (http://localhost:8080)..."
	@cd server && go run ./cmd/api

# ─── 构建命令 ────────────────────────────────────────────────────

## build: 构建前后端
build: build-server build-web

## build-server: 编译 Go 后端
build-server:
	@echo "🔨 编译 Go 后端..."
	@cd server && CGO_ENABLED=1 go build -o bin/growpilot-server ./cmd/api
	@echo "✅ 后端编译完成: server/bin/growpilot-server"

## build-web: 编译 Next.js 前端
build-web:
	@echo "🔨 编译前端..."
	@cd web && npm run build
	@echo "✅ 前端编译完成"

# ─── 依赖安装 ────────────────────────────────────────────────────

## install: 安装所有依赖
install: install-web install-server

## install-web: 安装前端依赖
install-web:
	@cd web && npm install

## install-server: 下载 Go 依赖
install-server:
	@cd server && go mod download && go mod tidy

# ─── Docker 命令 ─────────────────────────────────────────────────

## docker: 构建 Docker 镜像
docker:
	@docker compose build

## docker-up: 启动所有容器
docker-up:
	@docker compose up -d
	@echo "✅ GrowPilot 已启动"
	@echo "   前端: http://localhost:3003"
	@echo "   后端: http://localhost:8080"

## docker-down: 停止所有容器
docker-down:
	@docker compose down

## docker-logs: 查看容器日志
docker-logs:
	@docker compose logs -f

# ─── 工具命令 ────────────────────────────────────────────────────

## lint-server: Go 代码检查
lint-server:
	@cd server && go vet ./...

## lint-web: 前端代码检查
lint-web:
	@cd web && npm run lint

## health: 检查后端健康状态
health:
	@curl -s http://localhost:8080/api/health | python3 -m json.tool

## help: 显示帮助
help:
	@echo "GrowPilot 开发工具"
	@echo ""
	@grep -E '^##' Makefile | sed 's/## /  /'
