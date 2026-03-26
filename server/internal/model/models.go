package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ─── Base Model ──────────────────────────────────────────────────
type Base struct {
	ID        string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (b *Base) BeforeCreate(_ *gorm.DB) error {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return nil
}

// ─── User ────────────────────────────────────────────────────────
type User struct {
	Base
	Email          string  `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash   string  `gorm:"not null"             json:"-"`
	Name           string  `json:"name"`
	Avatar         string  `json:"avatar,omitempty"`
	Points         int     `gorm:"default:1250"         json:"points"`
	StorageTotalGb float64 `gorm:"default:50"           json:"storage_total_gb"`
}

// ─── Project ─────────────────────────────────────────────────────
// Mode 枚举: video | image | avatar | marketing | faceswap
// Status 枚举: draft | processing | completed | failed
type Project struct {
	Base
	UserID           string `gorm:"index;not null"        json:"user_id"`
	Name             string `gorm:"not null"              json:"name"`
	Mode             string `gorm:"not null;default:'image'" json:"mode"`      // video|image|avatar|marketing|faceswap
	ModelUsed        string `json:"model_used,omitempty"`                       // nano-banane | nano-banane-pro
	AspectRatio      string `json:"aspect_ratio,omitempty"`                     // 1:1 | 3:4 | 9:16 ...
	OutputCount      int    `gorm:"default:1"             json:"output_count"`
	Prompt           string `gorm:"type:text"             json:"prompt,omitempty"`
	CoverURL         string `json:"cover_url,omitempty"`
	Status           string `gorm:"default:'draft'"       json:"status"`       // draft|processing|completed|failed
	Progress         int    `gorm:"default:0"             json:"progress"`     // 0-100
	EstimatedMinutes int    `json:"estimated_minutes,omitempty"`
	ResultURLs       string `gorm:"type:text"             json:"result_urls,omitempty"` // JSON: [{type,url,name}]
	Category         string `json:"category,omitempty"`                         // 房产|教育|餐饮（demo分类）
	IsDemo           bool   `gorm:"default:false"         json:"is_demo"`
}

// ─── Asset ───────────────────────────────────────────────────────
type Asset struct {
	Base
	UserID string `gorm:"index;not null" json:"user_id"`
	Name   string `json:"name"`
	Type   string `json:"type"`      // image | video | voice
	URL    string `json:"url"`
	Size   int64  `json:"size"`
}

// ─── AITask ──────────────────────────────────────────────────────
type AITask struct {
	Base
	UserID    string     `gorm:"index;not null" json:"user_id"`
	Type      string     `json:"type"`          // text2img | text2video | faceswap
	Status    string     `gorm:"default:'pending'" json:"status"` // pending | processing | completed | failed
	Prompt    string     `gorm:"type:text"      json:"prompt"`
	ResultURL string     `json:"result_url,omitempty"`
	Error     string     `json:"error,omitempty"`
	FinishedAt *time.Time `json:"finished_at,omitempty"`
}

// ─── ChatSession ─────────────────────────────────────────────────
type ChatSession struct {
	Base
	UserID   string        `gorm:"index;not null"                    json:"user_id"`
	Title    string        `json:"title"`
	Messages []ChatMessage `gorm:"foreignKey:SessionID;references:ID" json:"messages,omitempty"`
}

// ─── ChatMessage ─────────────────────────────────────────────────
type ChatMessage struct {
	Base
	SessionID string `gorm:"index;not null" json:"session_id"`
	Role      string `json:"role"`    // user | assistant
	Content   string `gorm:"type:text" json:"content"`
}

// ─── Feedback ─────────────────────────────────────────────────────
type Feedback struct {
	Base
	UserID  string `gorm:"index"      json:"user_id,omitempty"`
	Type    string `json:"type"`    // general | bug | feature
	Content string `gorm:"type:text" json:"content"`
}
