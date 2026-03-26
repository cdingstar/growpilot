package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/growpilot/server/internal/middleware"
	"github.com/growpilot/server/internal/service"
)

type ProjectHandler struct {
	svc *service.ProjectService
}

func NewProjectHandler(svc *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{svc: svc}
}

// GET /api/projects?page=1&page_size=20&status=&mode=
func (h *ProjectHandler) List(c *gin.Context) {
	userID := middleware.CurrentUserID(c)

	var req service.ProjectListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	resp, err := h.svc.List(c.Request.Context(), userID, req)
	if err != nil {
		InternalError(c, err.Error())
		return
	}
	OK(c, resp)
}

// GET /api/projects/:id
func (h *ProjectHandler) Get(c *gin.Context) {
	userID := middleware.CurrentUserID(c)
	project, err := h.svc.Get(c.Request.Context(), userID, c.Param("id"))
	if err != nil {
		NotFound(c, err.Error())
		return
	}
	OK(c, project)
}

// POST /api/projects
func (h *ProjectHandler) Create(c *gin.Context) {
	userID := middleware.CurrentUserID(c)
	var req service.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}
	project, err := h.svc.Create(c.Request.Context(), userID, req)
	if err != nil {
		InternalError(c, err.Error())
		return
	}
	OK(c, project)
}

// PUT /api/projects/:id
func (h *ProjectHandler) Update(c *gin.Context) {
	userID := middleware.CurrentUserID(c)
	var req service.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}
	project, err := h.svc.Update(c.Request.Context(), userID, c.Param("id"), req)
	if err != nil {
		NotFound(c, err.Error())
		return
	}
	OK(c, project)
}

// DELETE /api/projects/:id
func (h *ProjectHandler) Delete(c *gin.Context) {
	userID := middleware.CurrentUserID(c)
	if err := h.svc.Delete(c.Request.Context(), userID, c.Param("id")); err != nil {
		NotFound(c, err.Error())
		return
	}
	OK(c, nil)
}

// POST /api/projects/init-demo  首次登录写入39条 demo 数据（幂等）
func (h *ProjectHandler) InitDemo(c *gin.Context) {
	userID := middleware.CurrentUserID(c)
	count, err := h.svc.InitDemo(c.Request.Context(), userID)
	if err != nil {
		InternalError(c, err.Error())
		return
	}
	OK(c, gin.H{"seeded": count})
}
