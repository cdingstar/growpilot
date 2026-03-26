package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/growpilot/server/internal/config"
	"github.com/growpilot/server/internal/model"
	"gorm.io/gorm"
)

// ─── Gemini API 请求/响应结构 ────────────────────────────────────
// 文档：https://ai.google.dev/api/generate-content

type geminiPart struct {
	Text       string            `json:"text,omitempty"`
	InlineData *geminiInlineData `json:"inlineData,omitempty"`
}

type geminiInlineData struct {
	MimeType string `json:"mimeType"`
	Data     string `json:"data"` // base64
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
	Role  string       `json:"role,omitempty"`
}

type geminiGenerateRequest struct {
	Contents         []geminiContent  `json:"contents"`
	GenerationConfig *geminiGenConfig `json:"generationConfig,omitempty"`
}

type geminiGenConfig struct {
	ResponseModalities []string `json:"responseModalities,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text       string `json:"text,omitempty"`
				InlineData *struct {
					MimeType string `json:"mimeType"`
					Data     string `json:"data"`
				} `json:"inlineData,omitempty"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// ─── AIService ───────────────────────────────────────────────────

type AIService struct {
	db         *gorm.DB
	httpClient *http.Client
	apiKey     string
	models     config.ModelConfig
}

func NewAIService(db *gorm.DB) *AIService {
	return &AIService{
		db:         db,
		httpClient: &http.Client{Timeout: 120 * time.Second},
		apiKey:     config.Global.AI.GoogleAPIKey,
		models:     config.Global.AI.Models,
	}
}

// geminiBaseURL Gemini REST API 基础地址
const geminiBaseURL = "https://generativelanguage.googleapis.com/v1beta/models"

// callGeminiGenerate 调用 Gemini generateContent 接口
func (s *AIService) callGeminiGenerate(ctx context.Context, modelName string, req geminiGenerateRequest) (*geminiResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/%s:generateContent?key=%s", geminiBaseURL, modelName, s.apiKey)

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("gemini api request failed: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini api error %d: %s", resp.StatusCode, string(respBytes))
	}

	var result geminiResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, err
	}

	if result.Error != nil {
		return nil, fmt.Errorf("gemini error %d: %s", result.Error.Code, result.Error.Message)
	}

	return &result, nil
}

// resolveModel 将前端 model 参数映射到实际 Gemini 模型名
//
//	"standard" | "nano-banane" | ""  → gemini-2.5-flash-image-preview-0924
//	"pro"      | "nano-banane-pro"   → gemini-3-pro-image-preview
//	其他字符串                        → 直接当模型名使用
func (s *AIService) resolveModel(input string) string {
	switch input {
	case "standard", "nano-banane", "":
		return s.models.ImageDefault
	case "pro", "nano-banane-pro":
		return s.models.ImagePro
	default:
		return input
	}
}

// ─── 文生图 ──────────────────────────────────────────────────────

type Text2ImgRequest struct {
	Prompt         string `json:"prompt"           binding:"required"`
	Model          string `json:"model"`            // "standard" | "pro" | 完整模型名
	AspectRatio    string `json:"aspect_ratio"`
	NumberOfImages int    `json:"number_of_images"`
	ImageSize      string `json:"image_size"`
}

type Text2ImgResult struct {
	TaskID         string `json:"task_id"`
	ImageURL       string `json:"image_url"`
	Model          string `json:"model"`
	EnhancedPrompt string `json:"enhanced_prompt,omitempty"`
}

func (s *AIService) Text2Img(ctx context.Context, userID string, req Text2ImgRequest) (*Text2ImgResult, error) {
	modelName := s.resolveModel(req.Model)

	// Gemini Image 生成请求
	genReq := geminiGenerateRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: req.Prompt},
				},
			},
		},
		GenerationConfig: &geminiGenConfig{
			ResponseModalities: []string{"TEXT", "IMAGE"},
		},
	}

	result, err := s.callGeminiGenerate(ctx, modelName, genReq)
	if err != nil {
		return nil, err
	}

	// 提取图片 base64 数据
	imageURL := ""
	textResult := ""
	if len(result.Candidates) > 0 {
		for _, part := range result.Candidates[0].Content.Parts {
			if part.InlineData != nil {
				imageURL = fmt.Sprintf("data:%s;base64,%s",
					part.InlineData.MimeType,
					part.InlineData.Data,
				)
			}
			if part.Text != "" {
				textResult = part.Text
			}
		}
	}

	if imageURL == "" {
		return nil, fmt.Errorf("no image returned from model: %s", modelName)
	}

	// 持久化任务记录
	taskID := uuid.New().String()
	now := time.Now()
	task := &model.AITask{
		Base:       model.Base{ID: taskID},
		UserID:     userID,
		Type:       "text2img",
		Status:     "completed",
		Prompt:     req.Prompt,
		ResultURL:  imageURL,
		FinishedAt: &now,
	}
	s.db.WithContext(ctx).Create(task)

	return &Text2ImgResult{
		TaskID:         taskID,
		ImageURL:       imageURL,
		Model:          modelName,
		EnhancedPrompt: textResult,
	}, nil
}

// ─── 图片编辑（图片 + Prompt → 新图）───────────────────────────

func (s *AIService) EditImage(ctx context.Context, userID string, prompt string, imageData []byte, mimeType string) (*Text2ImgResult, error) {
	// 图片编辑使用 pro 模型（理解能力更强）
	modelName := s.models.ImagePro

	imageBase64 := base64.StdEncoding.EncodeToString(imageData)

	genReq := geminiGenerateRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{
						InlineData: &geminiInlineData{
							MimeType: mimeType,
							Data:     imageBase64,
						},
					},
					{Text: prompt},
				},
			},
		},
		GenerationConfig: &geminiGenConfig{
			ResponseModalities: []string{"TEXT", "IMAGE"},
		},
	}

	result, err := s.callGeminiGenerate(ctx, modelName, genReq)
	if err != nil {
		return nil, err
	}

	imageURL := ""
	if len(result.Candidates) > 0 {
		for _, part := range result.Candidates[0].Content.Parts {
			if part.InlineData != nil {
				imageURL = fmt.Sprintf("data:%s;base64,%s",
					part.InlineData.MimeType,
					part.InlineData.Data,
				)
				break
			}
		}
	}

	if imageURL == "" {
		return nil, fmt.Errorf("no image returned from edit request")
	}

	taskID := uuid.New().String()
	now := time.Now()
	task := &model.AITask{
		Base:       model.Base{ID: taskID},
		UserID:     userID,
		Type:       "img2img",
		Status:     "completed",
		Prompt:     prompt,
		ResultURL:  imageURL,
		FinishedAt: &now,
	}
	s.db.WithContext(ctx).Create(task)

	return &Text2ImgResult{
		TaskID:   taskID,
		ImageURL: imageURL,
		Model:    modelName,
	}, nil
}

// ─── 文生视频（异步）────────────────────────────────────────────

type Text2VideoRequest struct {
	Prompt      string `json:"prompt"       binding:"required"`
	Model       string `json:"model"`
	Duration    int    `json:"duration"`
	AspectRatio string `json:"aspect_ratio"`
}

func (s *AIService) Text2Video(ctx context.Context, userID string, req Text2VideoRequest) (string, error) {
	taskID := uuid.New().String()
	task := &model.AITask{
		Base:   model.Base{ID: taskID},
		UserID: userID,
		Type:   "text2video",
		Status: "pending",
		Prompt: req.Prompt,
	}
	if err := s.db.WithContext(ctx).Create(task).Error; err != nil {
		return "", err
	}

	go s.processVideoTask(taskID, req)
	return taskID, nil
}

func (s *AIService) processVideoTask(taskID string, req Text2VideoRequest) {
	ctx := context.Background()

	s.db.WithContext(ctx).Model(&model.AITask{}).
		Where("id = ?", taskID).
		Update("status", "processing")

	// TODO: 集成 Google Veo 2 视频生成 API
	time.Sleep(3 * time.Second)

	now := time.Now()
	s.db.WithContext(ctx).Model(&model.AITask{}).
		Where("id = ?", taskID).
		Updates(map[string]interface{}{
			"status":      "failed",
			"error":       "Veo video generation API integration pending in Phase 2",
			"finished_at": now,
		})
}

// ─── 任务查询 ────────────────────────────────────────────────────

type TaskResult struct {
	TaskID    string `json:"task_id"`
	Status    string `json:"status"`
	ResultURL string `json:"result_url,omitempty"`
	Error     string `json:"error,omitempty"`
}

func (s *AIService) GetTask(ctx context.Context, userID, taskID string) (*TaskResult, error) {
	var task model.AITask
	if err := s.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", taskID, userID).
		First(&task).Error; err != nil {
		return nil, err
	}

	return &TaskResult{
		TaskID:    task.ID,
		Status:    task.Status,
		ResultURL: task.ResultURL,
		Error:     task.Error,
	}, nil
}
