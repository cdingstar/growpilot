package config

import (
	"bufio"
	"log"
	"os"
	"strings"

	"github.com/spf13/viper"
)

// Config 全局配置结构
type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	AI       AIConfig       `mapstructure:"ai"`
	CORS     CORSConfig     `mapstructure:"cors"`
	Storage  StorageConfig  `mapstructure:"storage"`
}

type ServerConfig struct {
	Port string `mapstructure:"port"`
	Mode string `mapstructure:"mode"` // debug | release
}

type DatabaseConfig struct {
	DSN string `mapstructure:"dsn"`
}

type JWTConfig struct {
	Secret          string `mapstructure:"secret"`
	AccessTokenTTL  int    `mapstructure:"access_token_ttl"`  // 分钟
	RefreshTokenTTL int    `mapstructure:"refresh_token_ttl"` // 天
}

// AIConfig AI 服务配置
type AIConfig struct {
	GoogleAPIKey string      `mapstructure:"google_api_key"`
	Models       ModelConfig `mapstructure:"models"`
}

// ModelConfig 模型层级配置
//
//	nano banane     → gemini-2.5-flash-image-preview-0924  （快速/标准）
//	nano banane pro → gemini-3-pro-image-preview             （高质量）
type ModelConfig struct {
	ImageStandard string `mapstructure:"image_standard"` // nano banane
	ImagePro      string `mapstructure:"image_pro"`      // nano banane pro
	ImageDefault  string `mapstructure:"image_default"`  // 当前默认
}

type CORSConfig struct {
	AllowOrigins []string `mapstructure:"allow_origins"`
}

type StorageConfig struct {
	UploadDir string `mapstructure:"upload_dir"`
}

var Global Config

// Load 从 .env + config.yaml + 环境变量 三层加载配置
func Load() {
	// 第一步：加载 .env 文件（最低优先级）
	loadDotEnv(".env")

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath(".")

	// 支持环境变量覆盖（GP_ 前缀）
	viper.SetEnvPrefix("GP")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	// 默认值
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("server.mode", "debug")
	viper.SetDefault("database.dsn", "data/growpilot.db")
	viper.SetDefault("jwt.secret", "change-me-in-production")
	viper.SetDefault("jwt.access_token_ttl", 60)
	viper.SetDefault("jwt.refresh_token_ttl", 30)
	viper.SetDefault("cors.allow_origins", []string{"http://localhost:3003"})
	viper.SetDefault("storage.upload_dir", "uploads")
	// 模型默认值
	viper.SetDefault("ai.models.image_standard", "gemini-2.5-flash-image-preview-0924")
	viper.SetDefault("ai.models.image_pro", "gemini-3-pro-image-preview")
	viper.SetDefault("ai.models.image_default", "gemini-2.5-flash-image-preview-0924")

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("[config] 未找到 config.yaml，使用默认值: %v", err)
	}

	if err := viper.Unmarshal(&Global); err != nil {
		log.Fatalf("[config] 配置解析失败: %v", err)
	}

	apiKeyMasked := "未配置"
	if k := Global.AI.GoogleAPIKey; len(k) > 8 {
		apiKeyMasked = k[:8] + "****"
	}
	log.Printf("[config] 加载完成 | port=%s mode=%s api_key=%s model_default=%s",
		Global.Server.Port, Global.Server.Mode, apiKeyMasked, Global.AI.Models.ImageDefault)
}

// loadDotEnv 解析 .env 文件并写入环境变量（已有的环境变量不覆盖）
func loadDotEnv(filename string) {
	f, err := os.Open(filename)
	if err != nil {
		return // .env 不存在不报错
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		// 已有环境变量不覆盖
		if os.Getenv(key) == "" {
			os.Setenv(key, val)
		}
	}
}
