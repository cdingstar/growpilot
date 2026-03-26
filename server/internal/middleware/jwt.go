package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/growpilot/server/internal/config"
)

const UserIDKey = "user_id"

// Claims JWT 载荷
type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateAccessToken 生成 access token（默认1小时）
func GenerateAccessToken(userID string) (string, error) {
	ttl := time.Duration(config.Global.JWT.AccessTokenTTL) * time.Minute
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Global.JWT.Secret))
}

// GenerateRefreshToken 生成 refresh token（默认30天）
func GenerateRefreshToken(userID string) (string, error) {
	ttl := time.Duration(config.Global.JWT.RefreshTokenTTL) * 24 * time.Hour
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Global.JWT.Secret))
}

// ParseToken 解析并验证 JWT
func ParseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(config.Global.JWT.Secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}

// JWTAuth JWT 认证中间件
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code": 40001,
				"msg":  "missing or invalid authorization header",
				"data": nil,
			})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := ParseToken(tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code": 40001,
				"msg":  "invalid or expired token",
				"data": nil,
			})
			return
		}

		c.Set(UserIDKey, claims.UserID)
		c.Next()
	}
}

// CurrentUserID 从 gin.Context 中获取当前用户 ID
func CurrentUserID(c *gin.Context) string {
	uid, _ := c.Get(UserIDKey)
	return uid.(string)
}
