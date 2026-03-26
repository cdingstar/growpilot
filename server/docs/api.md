# GrowPilot API 文档

> 基础 URL：`http://localhost:8080`
> 所有响应格式：`{ "code": 0, "msg": "ok", "data": {...} }`
> 认证方式：`Authorization: Bearer <access_token>`

---

## 公共接口

### 健康检查
```
GET /api/health
```
响应：`{ "status": "healthy", "version": "0.1.0" }`

---

## 认证 `/api/auth`

### 注册
```
POST /api/auth/register
Body: { "email": "user@example.com", "password": "123456", "name": "张三" }
```

### 登录
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "123456" }
Response: { "access_token": "...", "refresh_token": "...", "user": {...} }
```

### 刷新 Token
```
POST /api/auth/refresh
Body: { "refresh_token": "..." }
Response: { "access_token": "..." }
```

### 退出登录
```
POST /api/auth/logout  🔒
```

### 获取当前用户
```
GET /api/auth/me  🔒
Response: { "id": "...", "email": "...", "name": "...", "avatar": "..." }
```

---

## AI 能力 `/api/ai` 🔒

### 文生图
```
POST /api/ai/text2img
Body: {
  "prompt": "一只可爱的猫",
  "model": "imagen-4.0-generate-001",    // 可选
  "aspect_ratio": "1:1",                  // 可选: 1:1 | 3:4 | 4:3 | 9:16 | 16:9
  "number_of_images": 1,                  // 可选: 1-4
  "image_size": "1K"                      // 可选: 1K | 2K
}
Response: {
  "task_id": "uuid",
  "image_url": "data:image/jpeg;base64,...",
  "model": "imagen-4.0-generate-001",
  "enhanced_prompt": "..."
}
```

### 图片编辑
```
POST /api/ai/img2img  (multipart/form-data)
Fields: prompt(text), image(file)
Response: 同文生图
```

### 换脸
```
POST /api/ai/faceswap  (multipart/form-data)
Fields: source_image(file), target_image(file)
Response: { "task_id": "...", "image_url": "..." }
```

### 文生视频（异步）
```
POST /api/ai/text2video
Body: {
  "prompt": "海边日落的延时摄影",
  "model": "veo-2.0-generate-001",   // 可选
  "duration": 5,                      // 可选，秒
  "aspect_ratio": "16:9"             // 可选
}
Response: { "task_id": "uuid" }
```

### 查询任务状态
```
GET /api/ai/task/:id
Response: {
  "task_id": "uuid",
  "status": "pending|processing|completed|failed",
  "result_url": "https://...",
  "error": ""
}
```

---

## 项目管理 `/api/projects` 🔒

```
GET    /api/projects         列表
POST   /api/projects         创建  Body: { "name": "...", "type": "video|image|avatar" }
GET    /api/projects/:id     详情
PUT    /api/projects/:id     更新  Body: { "name": "...", "status": "..." }
DELETE /api/projects/:id     删除
```

---

## 资产管理 `/api/assets` 🔒

```
GET    /api/assets?type=image  列表（可按类型过滤）
POST   /api/assets             上传  (multipart: file, type)
DELETE /api/assets/:id         删除
```

---

## AI 营销助手 `/api/assistant` 🔒

```
POST /api/assistant/chat
Body: { "session_id": "uuid（可选）", "message": "帮我写一篇产品介绍" }
Response: SSE 流式文本
```

---

## 错误码

| code  | 含义        |
|-------|-------------|
| 0     | 成功        |
| 40000 | 请求参数错误 |
| 40001 | 未授权      |
| 40004 | 资源不存在  |
| 40901 | 数据冲突    |
| 50000 | 服务内部错误 |
