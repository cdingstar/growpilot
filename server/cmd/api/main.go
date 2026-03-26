package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/growpilot/server/internal/config"
	"github.com/growpilot/server/internal/handler"
	"github.com/growpilot/server/internal/middleware"
	"github.com/growpilot/server/internal/model"
	"github.com/growpilot/server/internal/service"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// ── 1. 加载配置 ──────────────────────────────────────────────
	config.Load()
	cfg := config.Global

	// ── 2. 初始化 Logger ─────────────────────────────────────────
	var logger *zap.Logger
	var err error
	if cfg.Server.Mode == "release" {
		logger, err = zap.NewProduction()
	} else {
		logger, err = zap.NewDevelopment()
	}
	if err != nil {
		log.Fatalf("failed to init logger: %v", err)
	}
	defer logger.Sync()

	// ── 3. 初始化数据库 ───────────────────────────────────────────
	if err := os.MkdirAll("data", 0755); err != nil {
		logger.Fatal("failed to create data dir", zap.Error(err))
	}

	db, err := gorm.Open(sqlite.Open(cfg.Database.DSN), &gorm.Config{})
	if err != nil {
		logger.Fatal("failed to connect database", zap.Error(err))
	}

	// 自动迁移表结构
	if err := db.AutoMigrate(
		&model.User{},
		&model.Project{},
		&model.Asset{},
		&model.AITask{},
		&model.ChatSession{},
		&model.ChatMessage{},
		&model.Feedback{},
	); err != nil {
		logger.Fatal("failed to migrate database", zap.Error(err))
	}
	logger.Info("database migrated successfully")

	// 初始化内置账号（仅首次，幂等）
	type seedUser struct{ email, password, name string }
	seeds := []seedUser{
		{"admin@growpilot.com", "admin", "Admin"},
		{"admin@abc.com", "123456", "Admin"},
		{"test1@growpilot.com", "Test1234", "测试用户1"},
		{"test2@growpilot.com", "Test1234", "测试用户2"},
		{"demo@growpilot.com", "Demo1234", "演示账号"},
	}
	for _, s := range seeds {
		var c int64
		db.Model(&model.User{}).Where("email = ?", s.email).Count(&c)
		if c == 0 {
			h, _ := bcrypt.GenerateFromPassword([]byte(s.password), bcrypt.DefaultCost)
			db.Create(&model.User{Email: s.email, PasswordHash: string(h), Name: s.name})
			logger.Info("seed user created", zap.String("email", s.email))
		}
	}

	// ── 4. 初始化 Services ────────────────────────────────────────
	authSvc := service.NewAuthService(db)
	aiSvc := service.NewAIService(db)
	projectSvc := service.NewProjectService(db)

	// ── 5. 初始化 Handlers ────────────────────────────────────────
	authH := handler.NewAuthHandler(authSvc)
	aiH := handler.NewAIHandler(aiSvc)
	projectH := handler.NewProjectHandler(projectSvc)
	summaryH := handler.NewSummaryHandler(db)
	feedbackH := handler.NewFeedbackHandler(db)

	// ── 6. 配置 Gin ───────────────────────────────────────────────
	gin.SetMode(cfg.Server.Mode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger(logger))

	// CORS（开发模式放宽 Origin，生产使用配置清单）
	corsCfg := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}
	if cfg.Server.Mode == "release" {
		corsCfg.AllowOrigins = cfg.CORS.AllowOrigins
	} else {
		corsCfg.AllowOriginFunc = func(origin string) bool { return true }
	}
	r.Use(cors.New(corsCfg))

	// ── 7. 路由注册 ────────────────────────────────────────────────
	// 健康检查（无需认证）
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"code": 0,
			"msg":  "ok",
				"data": gin.H{"status": "healthy", "version": "03.26.2159"},
		})
	})

	// 认证路由（无需 JWT）
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.POST("/refresh", authH.Refresh)
	}

	// 公开路由（无需 JWT）
	r.GET("/api/faq", feedbackH.FAQ)
	r.POST("/api/feedback", feedbackH.Submit)

	// 需要 JWT 的路由
	api := r.Group("/api", middleware.JWTAuth())
	{
		// 用户
		api.POST("/auth/logout", authH.Logout)
		api.GET("/auth/me", authH.Me)

		// AI 能力
		ai := api.Group("/ai")
		{
			ai.POST("/text2img", aiH.Text2Img)
			ai.POST("/img2img", aiH.EditImage)
			ai.POST("/faceswap", aiH.FaceSwap)
			ai.POST("/text2video", aiH.Text2Video)
			ai.GET("/task/:id", aiH.GetTask)
		}

		// 项目管理
		projects := api.Group("/projects")
		{
			projects.GET("", projectH.List)
			projects.POST("", projectH.Create)
			projects.POST("/init-demo", projectH.InitDemo) // 首次登录写入 demo 数据（幂等）
			projects.GET("/:id", projectH.Get)
			projects.PUT("/:id", projectH.Update)
			projects.DELETE("/:id", projectH.Delete)
		}

		// 用户摘要
		api.GET("/user/summary", summaryH.GetSummary)

		// AI 营销助手（Phase 4 实现）
		api.POST("/assistant/chat", aiH.AssistantChat)
	}

	// ── 8. 启动服务 ────────────────────────────────────────────────
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	logger.Info("🚀 GrowPilot server starting",
		zap.String("addr", addr),
		zap.String("mode", cfg.Server.Mode),
	)

	if err := r.Run(addr); err != nil {
		logger.Fatal("server failed to start", zap.Error(err))
	}
}
