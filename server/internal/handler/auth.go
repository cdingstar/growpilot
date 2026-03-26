package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/growpilot/server/internal/middleware"
	"github.com/growpilot/server/internal/service"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req service.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	resp, err := h.svc.Register(c.Request.Context(), req)
	if err != nil {
		Fail(c, http.StatusConflict, 40901, err.Error())
		return
	}
	OK(c, resp)
}

// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	resp, err := h.svc.Login(c.Request.Context(), req)
	if err != nil {
		Unauthorized(c, err.Error())
		return
	}
	OK(c, resp)
}

// POST /api/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// 无状态 JWT，客户端清除 token 即可
	// 后续可加入 token 黑名单（Redis）
	OK(c, nil)
}

// POST /api/auth/refresh
func (h *AuthHandler) Refresh(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		BadRequest(c, err.Error())
		return
	}

	claims, err := middleware.ParseToken(body.RefreshToken)
	if err != nil {
		Unauthorized(c, "invalid refresh token")
		return
	}

	accessToken, err := middleware.GenerateAccessToken(claims.UserID)
	if err != nil {
		InternalError(c, "failed to generate token")
		return
	}

	OK(c, gin.H{"access_token": accessToken})
}

// GET /api/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	userID := middleware.CurrentUserID(c)
	user, err := h.svc.GetProfile(c.Request.Context(), userID)
	if err != nil {
		NotFound(c, "user not found")
		return
	}
	OK(c, user)
}
