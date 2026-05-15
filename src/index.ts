import SpeakerModule from 'speaker';
import { EventEmitter } from 'events';

// Internal speaker instance type (from 'speaker' package)
type SpeakerInstance = InstanceType<typeof SpeakerModule>;

/**
 * Speaker configuration options matching the speaker package
 */
interface SpeakerOptions {
  channels?: number;
  bitDepth?: number;
  sampleRate?: number;
  signed?: boolean;
}

/**
 * Audio configuration parameters
 */
export interface AudioParams {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  signed: boolean;
}

/**
 * Speaker state
 */
export interface SpeakerState {
  isPlaying: boolean;
  queueSize: number;
}

/**
 * Speaker that plays audio continuously with a persistent instance.
 * Supports streaming audio buffers with automatic queue management.
 *
 * @example
 * ```typescript
 * import { Speaker } from '@chnak/speak';
 *
 * const speaker = new Speaker('audio/L16;rate=32000', 2);
 * speaker.push(audioBuffer);
 * ```
 */
export class Speaker extends EventEmitter {
  private options: AudioParams;
  private isPlaying: boolean = false;
  private bufferQueue: Buffer[] = [];
  private speaker: SpeakerInstance | null = null;

  /**
   * Create a new CustomSpeaker instance
   * @param config - Audio config string (e.g., 'audio/L16;rate=32000') or AudioParams object
   * @param channels - Number of audio channels (default: 1)
   */
  constructor(config?: string | Partial<AudioParams>, channels: number = 1) {
    super();
    this.options = this.parseAudioParams(config, channels);
    this._initialize();
  }

  /**
   * Parse audio parameters from config string or object
   */
  private parseAudioParams(config?: string | Partial<AudioParams>, channels: number = 1): AudioParams {
    const defaults: AudioParams = {
      sampleRate: 16000,
      channels: channels,
      bitDepth: 16,
      signed: true
    };

    if (!config) return defaults;

    if (typeof config === 'string') {
      const parts = config.split(';');
      parts.forEach(part => {
        if (part.startsWith('rate=')) {
          defaults.sampleRate = parseInt(part.split('=')[1], 10);
        }
      });
      defaults.channels = channels;
      return defaults;
    }

    return { ...defaults, ...config, channels };
  }

  private _initialize(): void {
    try {
      const speakerOptions: SpeakerOptions = {
        channels: this.options.channels,
        bitDepth: this.options.bitDepth,
        sampleRate: this.options.sampleRate,
        signed: this.options.signed
      };

      this.speaker = new SpeakerModule(speakerOptions) as SpeakerInstance;

      this.speaker!.on('finish', () => {
        this.emit('finish');
      });

      this.speaker!.on('error', (err: Error) => {
        console.error('Speaker error:', err);
        this._reinitializeSpeaker();
      });

      console.log(`Speaker initialized: ${JSON.stringify(this.options)}`);
      this.emit('ready');
    } catch (e) {
      console.error('Failed to initialize speaker:', e);
      setTimeout(() => this._initialize(), 1000);
    }
  }

  private _reinitializeSpeaker(): void {
    try {
      if (this.speaker) {
        this.speaker!.removeAllListeners();
        this.speaker = null;
      }

      this._initialize();

      if (this.bufferQueue.length > 0) {
        this._processQueue();
      }
    } catch (e) {
      console.error('Failed to reinitialize speaker:', e);
    }
  }

  private _processQueue(): void {
    if (!this.isPlaying && this.bufferQueue.length > 0) {
      this.isPlaying = true;
      this._playNextBuffer();
    }
  }

  private _playNextBuffer(): void {
    if (this.bufferQueue.length === 0 || !this.speaker) {
      this.isPlaying = false;
      this.emit('drain');
      return;
    }

    const buffer = this.bufferQueue.shift();
    if (!buffer) {
      this.isPlaying = false;
      this.emit('drain');
      return;
    }

    try {
      this.speaker!.write(buffer);
      console.log(`Playing: ${buffer.length} bytes, queue: ${this.bufferQueue.length}`);

      if (this.bufferQueue.length > 0) {
        this._playNextBuffer();
      } else {
        const silence = this.createSilenceBuffer(300, this.options.sampleRate, this.options.channels);
        this.speaker!.write(silence);
        this.isPlaying = false;
        this.emit('drain');
      }
    } catch (e) {
      console.error('Error playing buffer:', e);
      this._reinitializeSpeaker();
    }
  }

  /**
   * Create a silence buffer
   * @param durationMs - Duration in milliseconds
   * @param sampleRate - Sample rate (default: 44100)
   * @param channels - Number of channels (default: 2)
   */
  createSilenceBuffer(durationMs: number, sampleRate: number = 44100, channels: number = 2): Buffer {
    const samples = Math.floor((durationMs * sampleRate) / 1000);
    return Buffer.alloc(samples * channels * 2); // 16-bit = 2 bytes
  }

  /**
   * Push an audio buffer to the speaker for continuous playback
   * @param audioBuf - PCM audio buffer (16-bit signed)
   * @returns true if buffer was queued successfully
   */
  push(audioBuf: Buffer): boolean {
    if (!audioBuf || !(audioBuf instanceof Buffer)) {
      console.error('Invalid audio buffer provided');
      return false;
    }

    this.bufferQueue.push(audioBuf);
    console.log(`Buffer queued. Queue size: ${this.bufferQueue.length}`);
    this._processQueue();

    return true;
  }

  /**
   * Write an audio buffer (alias for push)
   * @param audioBuf - PCM audio buffer
   */
  write(audioBuf: Buffer): boolean {
    return this.push(audioBuf);
  }

  /**
   * End playback and clean up resources
   */
  end(): void {
    this.bufferQueue = [];

    if (this.speaker) {
      try {
        this.speaker!.end();
        this.speaker = null;
      } catch (e) {
        console.error('Error ending speaker:', e);
      }
    }

    this.isPlaying = false;
    console.log('Speaker resources cleaned up');
    this.emit('end');
  }

  /**
   * Check if the speaker has pending audio buffers
   */
  hasPendingBuffers(): boolean {
    return this.bufferQueue.length > 0 || this.isPlaying;
  }

  /**
   * Get the current state of the speaker
   */
  getState(): SpeakerState {
    return {
      isPlaying: this.isPlaying,
      queueSize: this.bufferQueue.length
    };
  }

  /**
   * Get the audio configuration
   */
  getOptions(): AudioParams {
    return { ...this.options };
  }
}

export default Speaker;