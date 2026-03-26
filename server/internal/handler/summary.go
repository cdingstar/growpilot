package handler

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/growpilot/server/internal/middleware"
	"github.com/growpilot/server/internal/model"
	"gorm.io/gorm"
)

type SummaryHandler struct {
	db *gorm.DB
}

func NewSummaryHandler(db *gorm.DB) *SummaryHandler {
	return &SummaryHandler{db: db}
}

type UserSummaryResponse struct {
	WeeklyCreations      int     `json:"weekly_creations"`
	WeeklyCreationsDelta string  `json:"weekly_creations_delta"`
	StorageUsedGb        float64 `json:"storage_used_gb"`
	StorageTotalGb       float64 `json:"storage_total_gb"`
	StorageUsedPct       float64 `json:"storage_used_pct"`
	Points               int     `json:"points"`
	PointsDelta          string  `json:"points_delta"`
	ComputeConsumed      int     `json:"compute_consumed"`
	ComputeDelta         string  `json:"compute_delta"`
	UserName             string  `json:"user_name"`
}

// GET /api/user/summary
func (h *SummaryHandler) GetSummary(c *gin.Context) {
	userID := middleware.CurrentUserID(c)

	// 用户信息
	var user model.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		NotFound(c, "user not found")
		return
	}

	// 本周创作数（最近7天创建的项目）
	weekAgo := time.Now().AddDate(0, 0, -7)
	var weeklyCreations int64
	h.db.Model(&model.Project{}).
		Where("user_id = ? AND created_at >= ?", userID, weekAgo).
		Count(&weeklyCreations)

	// 上周创作数（用于计算趋势）
	twoWeeksAgo := time.Now().AddDate(0, 0, -14)
	var lastWeekCreations int64
	h.db.Model(&model.Project{}).
		Where("user_id = ? AND created_at >= ? AND created_at < ?", userID, twoWeeksAgo, weekAgo).
		Count(&lastWeekCreations)

	creationsDelta := calcDeltaStr(int(weeklyCreations), int(lastWeekCreations))

	// 存储（以资产大小之和估算，单位 GB）
	var totalSize int64
	h.db.Model(&model.Asset{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(size), 0)").
		Scan(&totalSize)
	storageUsedGb := float64(totalSize) / (1024 * 1024 * 1024)
	if storageUsedGb < 0.1 && totalSize == 0 {
		storageUsedGb = 12.8 // demo 默认值
	}
	storagePct := 0.0
	if user.StorageTotalGb > 0 {
		storagePct = storageUsedGb / user.StorageTotalGb * 100
	}

	// 算力消耗（最近7天完成的AI任务数）
	var computeConsumed int64
	h.db.Model(&model.AITask{}).
		Where("user_id = ? AND created_at >= ?", userID, weekAgo).
		Count(&computeConsumed)
	var lastWeekCompute int64
	h.db.Model(&model.AITask{}).
		Where("user_id = ? AND created_at >= ? AND created_at < ?", userID, twoWeeksAgo, weekAgo).
		Count(&lastWeekCompute)
	computeDelta := calcDeltaStr(int(computeConsumed), int(lastWeekCompute))
	if computeConsumed == 0 {
		computeConsumed = 45 // demo 默认值
		computeDelta = "-15%"
	}

	// 积分趋势（demo 固定 +150）
	pointsDelta := "+150"

	OK(c, UserSummaryResponse{
		WeeklyCreations:      int(weeklyCreations),
		WeeklyCreationsDelta: creationsDelta,
		StorageUsedGb:        round2(storageUsedGb),
		StorageTotalGb:       user.StorageTotalGb,
		StorageUsedPct:       round2(storagePct),
		Points:               user.Points,
		PointsDelta:          pointsDelta,
		ComputeConsumed:      int(computeConsumed),
		ComputeDelta:         computeDelta,
		UserName:             user.Name,
	})
}

func calcDeltaStr(current, prev int) string {
	if prev == 0 {
		if current > 0 {
			return "+100%"
		}
		return "0%"
	}
	pct := float64(current-prev) / float64(prev) * 100
	if pct >= 0 {
		return "+" + formatPct(pct)
	}
	return formatPct(pct)
}

func formatPct(f float64) string {
	if f == float64(int(f)) {
		return itoa(int(f)) + "%"
	}
	return itoa(int(f)) + "%"
}

func itoa(i int) string {
	if i == 0 {
		return "0"
	}
	neg := i < 0
	if neg {
		i = -i
	}
	s := ""
	for i > 0 {
		s = string(rune('0'+i%10)) + s
		i /= 10
	}
	if neg {
		s = "-" + s
	}
	return s
}

func round2(f float64) float64 {
	return float64(int(f*100)) / 100
}
