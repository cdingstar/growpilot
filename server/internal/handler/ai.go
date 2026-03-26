package handler

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/growpilot/server/internal/middleware"
	"github.com/growpilot/server/internal/service"
)

type AIHandler struct {
	svc *service.AIService
}

func NewAIHandler(svc *service.AIService) *AIHandler {
	return &AIHandler{svc: svc}
}

// POST /api/ai/text2img
func (h *AIHandler) Text2Img(c *gin.Context) {
	userID := middleware.CurrentUserID(c)

	var req service.Text2ImgRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	result, err := h.svc.Text2Img(c.Request.Context(), userID, req)
	if err != nil {
		InternalError(c, err.Error())
		return
	}
	OK(c, result)
}

// POST /api/ai/img2img  (multipart)
func (h *AIHandler) EditImage(c *gin.Context) {
	userID := middleware.CurrentUserID(c)

	prompt := c.PostForm("prompt")
	if prompt == "" {
		BadRequest(c, "prompt is required")
		return
	}

	file, _, err := c.Request.FormFile("image")
	if err != nil {
		BadRequest(c, "image file is required")
		return
	}
	defer file.Close()

	imageData, err := io.ReadAll(file)
	if err != nil {
		InternalError(c, "failed to read image")
		return
	}

	result, err := h.svc.EditImage(c.Request.Context(), userID, prompt, imageData, "image/jpeg")
	if err != nil {
		InternalError(c, err.Error())
		return
	}
	OK(c, result)
}

// POST /api/ai/faceswap  (multipart)
func (h *AIHandler) FaceSwap(c *gin.Context) {
	userID := middleware.CurrentUserID(c)

	sourceFile, _, err := c.Request.FormFile("source_image")
	if err != nil {
		BadRequest(c, "source_image is required")
		return
	}
	defer sourceFile.Close()

	targetFile, _, err := c.Request.FormFile("target_image")
	if err != nil {
		BadRequest(c, "target_image is required")
		return
	}
	defer targetFile.Close()

	sourceData, _ := io.ReadAll(sourceFile)
	targetData, _ := io.ReadAll(targetFile)

	// 暂时返回占位响应，待接入真实换脸服务
	_ = userID
	_ = sourceData
	_ = targetData

	OK(c, gin.H{
		"task_id":   "placeholder",
		"image_url": "",
		"model":     "faceswap-v1",
		"msg":       "faceswap service will be integrated in Phase 2",
	})
}

// POST /api/ai/text2video
func (h *AIHandler) Text2Video(c *gin.Context) {
	userID := middleware.CurrentUserID(c)

	var req service.Text2VideoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	taskID, err := h.svc.Text2Video(c.Request.Context(), userID, req)
	if err != nil {
		InternalError(c, err.Error())
		return
	}
	OK(c, gin.H{"task_id": taskID})
}

// GET /api/ai/task/:id
func (h *AIHandler) GetTask(c *gin.Context) {
	userID := middleware.CurrentUserID(c)
	taskID := c.Param("id")

	result, err := h.svc.GetTask(c.Request.Context(), userID, taskID)
	if err != nil {
		NotFound(c, "task not found")
		return
	}
	OK(c, result)
}

// POST /api/assistant/chat  (流式)
func (h *AIHandler) AssistantChat(c *gin.Context) {
	// Phase 4 实现：此处先返回占位响应
	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "ok",
		"data": gin.H{"content": "AI营销助手即将上线，敬请期待！"},
	})
}
