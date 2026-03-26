# GrowPilot 项目规则

## 版本号规则（强制）

**每次修改代码完成后，必须同步更新所有版本号。**

版本格式：`MAJOR.MINOR.HHMM`
- `MAJOR.MINOR`：主版本与次版本，手动维护
- `HHMM`：本次代码修改完成时的本地时间（小时+分钟），例如 `1027` 表示 10:27

示例：`0.1.1027`

### 需要同步更新的位置

| 文件 | 字段/位置 |
|------|-----------|
| `web/package.json` | `"version"` |
| `web/components/shell/DashboardSidebar.tsx` | `appVersion` 常量 |
| `server/cmd/api/main.go` | health check 中的 `"version"` |

### 操作流程

1. 完成代码修改
2. 执行 `date +%H%M` 获取当前时间（如 `1027`）
3. 将三处版本号统一更新为 `0.1.<HHMM>`（主次版本不变时只改 HHMM 部分）
