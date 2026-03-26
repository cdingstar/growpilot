package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/growpilot/server/internal/middleware"
	"github.com/growpilot/server/internal/model"
	"gorm.io/gorm"
)

type FeedbackHandler struct {
	db *gorm.DB
}

func NewFeedbackHandler(db *gorm.DB) *FeedbackHandler {
	return &FeedbackHandler{db: db}
}

// GET /api/faq  (公开，无需登录)
func (h *FeedbackHandler) FAQ(c *gin.Context) {
	faqs := []gin.H{
		{"id": "1", "q": "GrowPilot 是什么？", "a": "GrowPilot 是面向内容创作者和商家的 AI 增长工具，帮助快速生成视频、图像等营销内容。"},
		{"id": "2", "q": "如何开始使用？", "a": "注册账号后，通过首页创建项目，选择 AI 视频、绘画或数字人等功能即可开始创作。"},
		{"id": "3", "q": "支持哪些平台？", "a": "目前支持 Meta、小红书、视频号、Google 等主流平台的内容生产。"},
		{"id": "4", "q": "积分如何使用？", "a": "积分用于消耗 AI 能力，每次生成视频、图像等任务均会消耗对应积分。"},
		{"id": "5", "q": "如何联系支持团队？", "a": "通过反馈功能提交问题，或发送邮件至 support@growpilot.ai。"},
	}
	OK(c, faqs)
}

// POST /api/feedback  (公开，无需登录；如已登录自动关联 userID)
func (h *FeedbackHandler) Submit(c *gin.Context) {
	var body struct {
		Type    string `json:"type"    binding:"required"`
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		BadRequest(c, err.Error())
		return
	}

	// Use c.Get directly to avoid panic when no user in context
	var userID string
	if uid, exists := c.Get(middleware.UserIDKey); exists {
		if s, ok := uid.(string); ok {
			userID = s
		}
	}

	fb := &model.Feedback{
		UserID:  userID,
		Type:    body.Type,
		Content: body.Content,
	}
	if err := h.db.Create(fb).Error; err != nil {
		InternalError(c, "failed to save feedback")
		return
	}
	OK(c, gin.H{"id": fb.ID})
}
