# IVD Video Workflow

一个零依赖的本地工具，用来把 `IVD` 行业主题生成成可切换时长的短视频草稿，默认 90 秒左右。

## 功能

- 输入一个 IVD 行业主题，生成标题、封面文案和可选 `60/90/120 秒` 口播稿
- 文案按 `描述 -> 分析 -> 观点` 的行业观察结构输出
- 支持 `行业报告风` 与 `爆款短视频风` 两种封面风格
- 优先生成 AI 图片风格封面，失败时自动回退到对应风格的本地封面图
- 可直接在页面里编辑标题、封面文案、Hook、正文和 CTA，并重建音频/字幕
- 草稿生成后可一键切换 A/B 两版封面，不重新生成音频和字幕
- 草稿生成后可一键切换标题 A/B，用当前选中的标题参与导出
- 草稿生成后会给出 4 个“标题 + 封面”候选方案卡片，可一键设为最终版
- 提供运行状态面板，显示当前模型、模式和 ffmpeg 状态
- 导出前内置质检，提前发现标题、封面、音频、字幕等问题
- 自动保留草稿历史，可重新打开旧主题继续筛选和导出
- 生成配音音频
- 生成字幕 `SRT`
- 确认后执行 `FFmpeg` 导出竖屏视频

## 启动

```bash
npm start
```

打开浏览器访问：

```text
http://127.0.0.1:3016
```

## LLM 配置

项目现在已经拆成了 5 个独立调用点，每个点都可以单独配置：

- `script`：文案生成
- `storyboard`：分镜生成
- `image`：封面生成
- `tts`：配音生成
- `moderation`：火山风控策略与医疗合规预检

项目支持两种来源：

1. `.env.local`
用于默认值和向后兼容

参考：
[.env.local.example](/Users/GY/dev/videoing/.env.local.example)

2. `data/config/llm-config.json`
用于“每个调用点完整独立配置”的后端配置逻辑

参考：
[llm-config.example.json](/Users/GY/dev/videoing/data/config/llm-config.example.json)

如果你想直接按“同一代理、各调用点独立控制”的方式填写，可以参考：
[llm-config.proxy-template.json](/Users/GY/dev/videoing/data/config/llm-config.proxy-template.json)

现在页面左侧也已经带了 `LLM 配置` 面板，可以直接在后台维护这 5 个调用点。

### 代理模板字段映射

现在每个调用点都单独维护完整参数，映射关系是：

- `协议` -> `<route>.provider`
- `接口地址`
  - 网关地址 -> `<route>.baseURL`
  - 某个调用点自己的接口地址 -> `<route>.endpoint`
- `模型名 / 服务名`
  - 文案 -> `script.model`
  - 分镜 -> `storyboard.model`
  - 封面 -> `image.model`
  - 配音 -> `tts.model`
  - 审核 -> `moderation.serviceName`（内部仍保留 `moderation.model` 兼容）
- `鉴权头` -> `<route>.authHeader`
- `鉴权方式` -> `<route>.authScheme`
- `API Key` -> `<route>.apiKey`

如果你想让 5 个调用点都完全独立控制，最常见的一组就是：

```json
{
  "script": {
    "provider": "openai-compatible",
    "baseURL": "https://your-gateway.example.com",
    "apiKey": "sk-or-gateway-key",
    "authHeader": "Authorization",
    "authScheme": "Bearer",
    "enabled": true,
    "apiKind": "chat_completions",
    "endpoint": "/v1/chat/completions",
    "model": "gpt-5.2"
  },
  "storyboard": {
    "provider": "openai-compatible",
    "baseURL": "https://your-gateway.example.com",
    "apiKey": "sk-or-gateway-key",
    "authHeader": "Authorization",
    "authScheme": "Bearer",
    "enabled": true,
    "apiKind": "chat_completions",
    "endpoint": "/v1/chat/completions",
    "model": "gpt-5.2"
  },
  "image": {
    "provider": "openai-compatible",
    "baseURL": "https://your-gateway.example.com",
    "apiKey": "sk-or-gateway-key",
    "authHeader": "Authorization",
    "authScheme": "Bearer",
    "enabled": true,
    "endpoint": "/v1/images/generations",
    "model": "gpt-image-1",
    "quality": "high",
    "size": "1024x1536",
    "outputFormat": "png"
  },
  "tts": {
    "provider": "openai-compatible",
    "baseURL": "https://your-gateway.example.com",
    "apiKey": "sk-or-gateway-key",
    "appId": "",
    "resourceId": "seed-tts-2.0",
    "authHeader": "Authorization",
    "authScheme": "Bearer",
    "enabled": true,
    "endpoint": "/v1/audio/speech",
    "model": "tts-1-hd",
    "voice": "alloy",
    "format": "mp3"
  },
  "moderation": {
    "provider": "volcengine-medical-risk",
    "baseURL": "https://visual.volcengineapi.com",
    "apiKey": "your-access-key-id",
    "secretKey": "your-secret-key",
    "region": "cn-north-1",
    "service": "cv",
    "authHeader": "Authorization",
    "authScheme": "HMAC-SHA256",
    "enabled": true,
    "endpoint": "/?Action=TextRisk&Version=2022-08-31",
    "model": "text_risk",
    "serviceName": "text_risk",
    "scene": "ad_compliance",
    "strategyId": "medical_standard",
    "textCheckers": "medical_fake_ad,drug_forbidden,doctor_qualification",
    "imageCheckers": "uncomfortable,ocr"
  }
}
```

豆包语音 2.0 的 `tts` 调用点可以单独改成：

```json
{
  "tts": {
    "provider": "volcengine-doubao-tts",
    "baseURL": "https://openspeech.bytedance.com",
    "apiKey": "your-access-key",
    "appId": "your-app-id",
    "resourceId": "seed-tts-2.0",
    "authHeader": "Authorization",
    "authScheme": "Bearer",
    "enabled": true,
    "apiKind": "native",
    "endpoint": "/api/v3/tts/unidirectional",
    "model": "seed-tts-2.0",
    "voice": "zh_female_wanwanxiaohe_moon_bigtts",
    "format": "mp3"
  }
}
```

火山即梦 / Seedream 官方图片接口的 `image` 调用点可以单独改成：

```json
{
  "image": {
    "provider": "volcengine-jimeng-image",
    "baseURL": "https://visual.volcengineapi.com",
    "apiKey": "your-access-key-id",
    "secretKey": "your-secret-key",
    "authHeader": "Authorization",
    "authScheme": "HMAC-SHA256",
    "enabled": true,
    "apiKind": "native",
    "endpoint": "/?Action=CVProcess&Version=2022-08-31",
    "queryEndpoint": "/?Action=CVSync2AsyncGetResult&Version=2022-08-31",
    "model": "jimeng_t2i_v40",
    "region": "cn-north-1",
    "service": "cv",
    "pollIntervalMs": 1200,
    "pollAttempts": 15,
    "size": "1024x1536",
    "outputFormat": "png"
  }
}
```

这份模板我已经直接放到了：
[llm-config.json](/Users/GY/dev/videoing/data/config/llm-config.json)

## 环境变量

可选环境变量：

```bash
export OPENAI_API_KEY=your_key
export OPENAI_BASE_URL=https://api.openai.com
export OPENAI_AUTH_HEADER=Authorization
export OPENAI_AUTH_SCHEME=Bearer
export OPENAI_TEXT_API_KIND=responses
export OPENAI_TEXT_ENDPOINT=/v1/responses
export OPENAI_TEXT_MODEL=gpt-5.2
export OPENAI_TEXT_BASE_URL=https://api.openai.com
export OPENAI_TEXT_API_KEY=your_key
export OPENAI_STORYBOARD_API_KIND=responses
export OPENAI_STORYBOARD_ENDPOINT=/v1/responses
export OPENAI_STORYBOARD_MODEL=gpt-5.2
export OPENAI_STORYBOARD_BASE_URL=https://api.openai.com
export OPENAI_STORYBOARD_API_KEY=your_key
export OPENAI_IMAGE_ENDPOINT=/v1/images/generations
export OPENAI_IMAGE_MODEL=gpt-image-1
export OPENAI_IMAGE_BASE_URL=https://api.openai.com
export OPENAI_IMAGE_API_KEY=your_key
export OPENAI_IMAGE_QUALITY=high
export OPENAI_IMAGE_SIZE=1024x1536
export OPENAI_IMAGE_OUTPUT_FORMAT=png
export OPENAI_TTS_ENDPOINT=/v1/audio/speech
export OPENAI_TTS_MODEL=tts-1-hd
export OPENAI_TTS_BASE_URL=https://api.openai.com
export OPENAI_TTS_API_KEY=your_key
export OPENAI_TTS_VOICE=alloy
export OPENAI_TTS_FORMAT=mp3
export OPENAI_MODERATION_ENDPOINT=/v1/moderations
export OPENAI_MODERATION_MODEL=text-moderation-latest
export OPENAI_MODERATION_BASE_URL=https://api.openai.com
export OPENAI_MODERATION_API_KEY=your_key
export LOCAL_TTS_VOICE=Ting-Ting
```

说明：

- 文案链路支持两种格式：
  - `responses`
  - `chat_completions`
- 分镜链路也支持两种格式：
  - `responses`
  - `chat_completions`
- 如果你的代理只兼容 `/v1/chat/completions`，把 `OPENAI_TEXT_API_KIND=chat_completions`，并把 `OPENAI_TEXT_ENDPOINT` 改成你的代理地址即可
- 即使多个调用点走同一个代理，也建议分别填写各自的 `baseURL / apiKey / endpoint / model`，这样后面切换时不会互相影响
- 图片、配音、审核链路都支持单独设置 endpoint / model / key
- 任一调用点未启用远程配置时，会自动回退到本地兜底逻辑
- 导出视频需要系统安装 `ffmpeg`

## 目录

- `data/drafts/<draft-id>/draft.json`：结构化草稿
- `draft.json` 里现在同时包含：
  - `script`：整条口播稿
  - `storyboard`：分镜草稿
  - `timeline`：时间轴草稿
- `data/drafts/<draft-id>/scenes/`：分镜素材文件
- `data/drafts/<draft-id>/cover.svg`：封面图
- `data/drafts/<draft-id>/voice.aiff|voice.mp3`：配音
- `data/drafts/<draft-id>/subtitles.srt`：字幕
- `data/drafts/<draft-id>/export-video.sh`：导出脚本

## 导出说明

在网页里点“确认并导出”时，服务会优先直接调用 `ffmpeg`。
当前导出已经按 `storyboard + timeline` 生成多场景视频，而不是只输出单页口播模板。

如果本机没有 `ffmpeg`，工具会保留完整的导出脚本，安装完成后可手动执行：

```bash
sh data/drafts/<draft-id>/export-video.sh
```
