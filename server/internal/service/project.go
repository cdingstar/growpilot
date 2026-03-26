package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/growpilot/server/internal/model"
	"gorm.io/gorm"
)

// ─── 请求/响应结构 ────────────────────────────────────────────────

type CreateProjectRequest struct {
	Name        string `json:"name"         binding:"required"`
	Mode        string `json:"mode"         binding:"required,oneof=video image avatar marketing faceswap"`
	ModelUsed   string `json:"model_used"`
	AspectRatio string `json:"aspect_ratio"`
	OutputCount int    `json:"output_count"`
	Prompt      string `json:"prompt"`
	CoverURL    string `json:"cover_url"`
}

type UpdateProjectRequest struct {
	Name             string `json:"name"`
	Status           string `json:"status"`
	Progress         int    `json:"progress"`
	EstimatedMinutes int    `json:"estimated_minutes"`
	CoverURL         string `json:"cover_url"`
	ResultURLs       string `json:"result_urls"`
}

type ProjectListRequest struct {
	Page     int    `form:"page"`
	PageSize int    `form:"page_size"`
	Status   string `form:"status"`
	Mode     string `form:"mode"`
}

type ResultAttachment struct {
	Type string `json:"type"` // image | video
	URL  string `json:"url"`
	Name string `json:"name"`
}

type ProjectListItem struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Mode             string    `json:"mode"`
	CoverURL         string    `json:"cover_url,omitempty"`
	Status           string    `json:"status"`
	Progress         int       `json:"progress"`
	EstimatedMinutes int       `json:"estimated_minutes,omitempty"`
	Category         string    `json:"category,omitempty"`
	IsDemo           bool      `json:"is_demo"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type ProjectDetail struct {
	ProjectListItem
	ModelUsed   string             `json:"model_used,omitempty"`
	AspectRatio string             `json:"aspect_ratio,omitempty"`
	OutputCount int                `json:"output_count"`
	Prompt      string             `json:"prompt,omitempty"`
	ResultURLs  []ResultAttachment `json:"result_urls,omitempty"`
	CreatedAt   time.Time          `json:"created_at"`
}

type ProjectListResponse struct {
	Total    int64             `json:"total"`
	Page     int               `json:"page"`
	PageSize int               `json:"page_size"`
	Items    []ProjectListItem `json:"items"`
}

// ─── ProjectService ──────────────────────────────────────────────

type ProjectService struct {
	db *gorm.DB
}

func NewProjectService(db *gorm.DB) *ProjectService {
	return &ProjectService{db: db}
}

// List 分页查询项目列表
func (s *ProjectService) List(ctx context.Context, userID string, req ProjectListRequest) (*ProjectListResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	query := s.db.WithContext(ctx).Model(&model.Project{}).Where("user_id = ?", userID)
	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}
	if req.Mode != "" {
		query = query.Where("mode = ?", req.Mode)
	}

	var total int64
	query.Count(&total)

	var projects []model.Project
	err := query.Order("updated_at DESC").
		Offset((req.Page - 1) * req.PageSize).
		Limit(req.PageSize).
		Find(&projects).Error
	if err != nil {
		return nil, err
	}

	items := make([]ProjectListItem, 0, len(projects))
	for _, p := range projects {
		items = append(items, toListItem(p))
	}

	return &ProjectListResponse{
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
		Items:    items,
	}, nil
}

// Get 获取项目详情
func (s *ProjectService) Get(ctx context.Context, userID, projectID string) (*ProjectDetail, error) {
	var p model.Project
	err := s.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", projectID, userID).
		First(&p).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("project not found")
	}
	if err != nil {
		return nil, err
	}
	return toDetail(p), nil
}

// Create 新建项目
func (s *ProjectService) Create(ctx context.Context, userID string, req CreateProjectRequest) (*ProjectDetail, error) {
	count := req.OutputCount
	if count <= 0 {
		count = 1
	}
	p := &model.Project{
		UserID:      userID,
		Name:        req.Name,
		Mode:        req.Mode,
		ModelUsed:   req.ModelUsed,
		AspectRatio: req.AspectRatio,
		OutputCount: count,
		Prompt:      req.Prompt,
		CoverURL:    req.CoverURL,
		Status:      "draft",
	}
	if err := s.db.WithContext(ctx).Create(p).Error; err != nil {
		return nil, err
	}
	return toDetail(*p), nil
}

// Update 更新项目
func (s *ProjectService) Update(ctx context.Context, userID, projectID string, req UpdateProjectRequest) (*ProjectDetail, error) {
	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.Progress > 0 {
		updates["progress"] = req.Progress
	}
	if req.EstimatedMinutes > 0 {
		updates["estimated_minutes"] = req.EstimatedMinutes
	}
	if req.CoverURL != "" {
		updates["cover_url"] = req.CoverURL
	}
	if req.ResultURLs != "" {
		updates["result_urls"] = req.ResultURLs
	}

	result := s.db.WithContext(ctx).Model(&model.Project{}).
		Where("id = ? AND user_id = ?", projectID, userID).
		Updates(updates)
	if result.RowsAffected == 0 {
		return nil, errors.New("project not found")
	}
	return s.Get(ctx, userID, projectID)
}

// Delete 删除项目
func (s *ProjectService) Delete(ctx context.Context, userID, projectID string) error {
	result := s.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", projectID, userID).
		Delete(&model.Project{})
	if result.RowsAffected == 0 {
		return errors.New("project not found")
	}
	return result.Error
}

// InitDemo 首次登录自动写入39条 demo 数据（幂等，重复调用无副作用）
func (s *ProjectService) InitDemo(ctx context.Context, userID string) (int, error) {
	var count int64
	s.db.WithContext(ctx).Model(&model.Project{}).
		Where("user_id = ? AND is_demo = ?", userID, true).
		Count(&count)
	if count > 0 {
		return 0, nil // 已初始化，直接返回
	}

	projects := buildDemoProjects(userID)
	if err := s.db.WithContext(ctx).CreateInBatches(projects, 20).Error; err != nil {
		return 0, err
	}
	return len(projects), nil
}

// ─── Demo 种子数据 ────────────────────────────────────────────────

type demoTheme struct {
	category string
	title    string
	mode     string
}

var demoThemes = []demoTheme{
	{category: "房产", title: "房产 Agent 获客", mode: "video"},
	{category: "教育", title: "教育课程招生", mode: "image"},
	{category: "餐饮", title: "餐饮门店促销", mode: "avatar"},
}

var demoCoverPools = map[string][]string{
	"房产": {
		"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
	},
	"教育": {
		"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
	},
	"餐饮": {
		"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
		"https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
	},
}

func buildDemoProjects(userID string) []model.Project {
	baseTime := time.Date(2025, 12, 18, 9, 12, 0, 0, time.UTC)
	projects := make([]model.Project, 0, 39)

	for i := 0; i < 39; i++ {
		theme := demoThemes[i%len(demoThemes)]
		pool := demoCoverPools[theme.category]
		cover := pool[i%len(pool)]
		name := fmt.Sprintf("%s · 方案%02d", theme.title, i+1)
		updatedAt := baseTime.Add(-time.Duration(i*27) * time.Minute)

		status := "completed"
		progress := 100
		estimatedMins := 0

		if i == 0 {
			status = "processing"
			progress = 33
			estimatedMins = 50
		} else if (i+1)%11 == 0 {
			status = "processing"
			progress = 12 + (i%5)*16
			estimatedMins = 35 + (i%4)*10
		}

		nextCover := pool[(i+1)%len(pool)]
		thirdCover := pool[(i+2)%len(pool)]
		attachments := []ResultAttachment{
			{Type: "image", URL: cover, Name: "主视觉"},
			{Type: "image", URL: nextCover, Name: "参考素材"},
			{Type: "image", URL: thirdCover, Name: "参考素材"},
			{Type: "video", URL: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", Name: "参考视频"},
		}
		resultURLsJSON, _ := json.Marshal(attachments)

		p := model.Project{
			UserID:           userID,
			Name:             name,
			Mode:             theme.mode,
			ModelUsed:        "nano-banane-pro",
			AspectRatio:      "3:4",
			OutputCount:      4,
			Prompt:           buildDemoPrompt(theme.category),
			CoverURL:         cover,
			Status:           status,
			Progress:         progress,
			EstimatedMinutes: estimatedMins,
			ResultURLs:       string(resultURLsJSON),
			Category:         theme.category,
			IsDemo:           true,
		}
		p.UpdatedAt = updatedAt
		projects = append(projects, p)
	}
	return projects
}

func buildDemoPrompt(category string) string {
	switch category {
	case "房产":
		return "为房产中介拍摄15秒带看视频：展示核心户型优势，引导预约看房，风格专业温暖。"
	case "教育":
		return "生成教育课程广告海报：突出师资与通过率，清爽蓝白配色，强CTA引导报名。"
	default:
		return "为餐饮门店制作同城推广素材：展示招牌菜品，节奏轻快，限时优惠引导到店。"
	}
}

// ─── 内部转换 ─────────────────────────────────────────────────────

func toListItem(p model.Project) ProjectListItem {
	return ProjectListItem{
		ID:               p.ID,
		Name:             p.Name,
		Mode:             p.Mode,
		CoverURL:         p.CoverURL,
		Status:           p.Status,
		Progress:         p.Progress,
		EstimatedMinutes: p.EstimatedMinutes,
		Category:         p.Category,
		IsDemo:           p.IsDemo,
		UpdatedAt:        p.UpdatedAt,
	}
}

func toDetail(p model.Project) *ProjectDetail {
	detail := &ProjectDetail{
		ProjectListItem: toListItem(p),
		ModelUsed:       p.ModelUsed,
		AspectRatio:     p.AspectRatio,
		OutputCount:     p.OutputCount,
		Prompt:          p.Prompt,
		CreatedAt:       p.CreatedAt,
	}
	if p.ResultURLs != "" {
		var attachments []ResultAttachment
		if json.Unmarshal([]byte(p.ResultURLs), &attachments) == nil {
			detail.ResultURLs = attachments
		}
	}
	return detail
}
