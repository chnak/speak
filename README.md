# @chnak/speak

Node.js 流媒体音频播放器，持久化 Speaker 实例。

## 特性

- 持久化 Speaker 实例，流畅播放音频
- 自动缓冲队列管理
- 错误自动恢复和重连
- 支持流式音频缓冲区
- 事件驱动架构

## 安装

```bash
npm install @chnak/speak
```

## 使用

### ESM

```javascript
import { CustomSpeaker } from '@chnak/speak';

const speaker = new CustomSpeaker('audio/L16;rate=32000', 2);

// 推送 PCM 音频缓冲区
speaker.push(audioBuffer);

// 监听事件
speaker.on('finish', () => console.log('播放完成'));
speaker.on('error', (err) => console.error('错误:', err));

// 查看状态
console.log(speaker.getState());  // { isPlaying: true, queueSize: 3 }

// 停止播放
speaker.end();
```

### CommonJS

```javascript
const { CustomSpeaker } = require('@chnak/speak');

const speaker = new CustomSpeaker('audio/L16;rate=32000', 2);
speaker.push(audioBuffer);
```

## API

### `new CustomSpeaker(config?, channels?)`

创建扬声器实例。

**参数：**
- `config` - 音频配置字符串（如 `'audio/L16;rate=32000'`）或 `AudioParams` 对象
- `channels` - 声道数（默认：1）

**配置字符串格式：**
- `rate=<采样率>` - 设置采样率（如 `rate=32000`）
- 示例：`'audio/L16;rate=32000'` = 16位 PCM，32kHz 采样率

### `speaker.push(buffer)`

将 PCM 音频缓冲区推入播放队列。

**参数：**
- `buffer` - `Buffer`（16位有符号 PCM）

**返回：** `boolean` - 是否成功

### `speaker.write(buffer)`

`push()` 的别名。

### `speaker.end()`

停止播放并清理资源。

### `speaker.getState()`

获取当前状态。

**返回：** `{ isPlaying: boolean, queueSize: number }`

### `speaker.hasPendingBuffers()`

检查是否有待播放的缓冲区。

**返回：** `boolean`

### `speaker.getOptions()`

获取音频配置。

**返回：** `AudioParams`

### `speaker.createSilenceBuffer(durationMs, sampleRate?, channels?)`

创建静音缓冲区，用于测试或填充。

## 事件

| 事件 | 说明 |
|------|------|
| `ready` | 初始化完成 |
| `finish` | 音频流结束 |
| `drain` | 队列清空 |
| `end` | 资源清理完成 |
| `error` | 播放出错 |

## 类型定义

```typescript
interface AudioParams {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  signed: boolean;
}

interface SpeakerState {
  isPlaying: boolean;
  queueSize: number;
}
```

## 构建

```bash
npm run build    # 构建 ESM 和 CJS
npm run dev      # 监视模式
npm test         # 运行测试
```

## 许可证

MIT