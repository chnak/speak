import { EventEmitter } from 'events';

/**
 * Audio configuration parameters
 */
interface AudioParams {
    sampleRate: number;
    channels: number;
    bitDepth: number;
    signed: boolean;
}
/**
 * Speaker state
 */
interface SpeakerState {
    isPlaying: boolean;
    queueSize: number;
}
/**
 * Custom speaker that plays audio continuously using a persistent speaker instance.
 * Supports streaming audio buffers with automatic queue management.
 *
 * @example
 * ```typescript
 * import { CustomSpeaker } from 'speak-engine';
 *
 * const speaker = new CustomSpeaker('audio/L16;rate=32000', 2);
 * speaker.push(audioBuffer);
 * ```
 */
declare class CustomSpeaker extends EventEmitter {
    private options;
    private isPlaying;
    private bufferQueue;
    private speaker;
    /**
     * Create a new CustomSpeaker instance
     * @param config - Audio config string (e.g., 'audio/L16;rate=32000') or AudioParams object
     * @param channels - Number of audio channels (default: 1)
     */
    constructor(config?: string | Partial<AudioParams>, channels?: number);
    /**
     * Parse audio parameters from config string or object
     */
    private parseAudioParams;
    private _initialize;
    private _reinitializeSpeaker;
    private _processQueue;
    private _playNextBuffer;
    /**
     * Create a silence buffer
     * @param durationMs - Duration in milliseconds
     * @param sampleRate - Sample rate (default: 44100)
     * @param channels - Number of channels (default: 2)
     */
    createSilenceBuffer(durationMs: number, sampleRate?: number, channels?: number): Buffer;
    /**
     * Push an audio buffer to the speaker for continuous playback
     * @param audioBuf - PCM audio buffer (16-bit signed)
     * @returns true if buffer was queued successfully
     */
    push(audioBuf: Buffer): boolean;
    /**
     * Write an audio buffer (alias for push)
     * @param audioBuf - PCM audio buffer
     */
    write(audioBuf: Buffer): boolean;
    /**
     * End playback and clean up resources
     */
    end(): void;
    /**
     * Check if the speaker has pending audio buffers
     */
    hasPendingBuffers(): boolean;
    /**
     * Get the current state of the speaker
     */
    getState(): SpeakerState;
    /**
     * Get the audio configuration
     */
    getOptions(): AudioParams;
}

export { type AudioParams, CustomSpeaker, type SpeakerState, CustomSpeaker as default };
