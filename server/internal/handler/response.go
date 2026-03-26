package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// OK 返回成功响应
func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "ok",
		"data": data,
	})
}

// Fail 返回错误响应
func Fail(c *gin.Context, httpStatus int, code int, msg string) {
	c.JSON(httpStatus, gin.H{
		"code": code,
		"msg":  msg,
		"data": nil,
	})
}

// BadRequest 400
func BadRequest(c *gin.Context, msg string) {
	Fail(c, http.StatusBadRequest, 40000, msg)
}

// Unauthorized 401
func Unauthorized(c *gin.Context, msg string) {
	Fail(c, http.StatusUnauthorized, 40001, msg)
}

// NotFound 404
func NotFound(c *gin.Context, msg string) {
	Fail(c, http.StatusNotFound, 40004, msg)
}

// InternalError 500
func InternalError(c *gin.Context, msg string) {
	Fail(c, http.StatusInternalServerError, 50000, msg)
}
