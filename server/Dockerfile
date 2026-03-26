# ── 构建阶段 ─────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /app

# 安装 CGO 依赖（SQLite 需要）
RUN apk add --no-cache gcc musl-dev sqlite-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -o growpilot-server ./cmd/api

# ── 运行阶段 ─────────────────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache sqlite-libs ca-certificates wget

COPY --from=builder /app/growpilot-server .
COPY --from=builder /app/configs ./configs

RUN mkdir -p data uploads

EXPOSE 8080

CMD ["./growpilot-server"]
