/**
 * Test script for speak-engine
 * Run: npm test
 */

import { CustomSpeaker } from './dist/cjs/index.js';

// Create speaker instance: config string and channels
const speaker = new CustomSpeaker('audio/L16;rate=32000', 2);

// Helper: create a simple sine wave buffer for testing
function createToneBuffer(frequency: number = 440, durationMs: number = 500, sampleRate: number = 32000, channels: number = 2): Buffer {
  const samples = Math.floor((durationMs * sampleRate) / 1000);
  const buffer = Buffer.alloc(samples * channels * 2); // 16-bit

  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;

    for (let ch = 0; ch < channels; ch++) {
      buffer.writeInt16LE(Math.floor(int16), i * channels * 2 + ch * 2);
    }
  }

  return buffer;
}

async function test(): Promise<void> {
  console.log('Testing CustomSpeaker...\n');

  // Test speaker state
  console.log('Initial state:', speaker.getState());

  // Play a 440Hz tone (A4 note)
  console.log('\n1. Playing 440Hz tone (500ms)...');
  const tone1 = createToneBuffer(440, 500);
  speaker.push(tone1);

  // Wait a bit then play another tone
  await new Promise(resolve => setTimeout(resolve, 700));

  // Play a 880Hz tone (A5 note)
  console.log('2. Playing 880Hz tone (500ms)...');
  const tone2 = createToneBuffer(880, 500);
  speaker.push(tone2);

  // Wait for playback to complete
  await new Promise(resolve => setTimeout(resolve, 700));

  console.log('\n3. Final state:', speaker.getState());

  // Cleanup
  console.log('\n4. Cleaning up...');
  speaker.end();

  console.log('\nTest completed!');
}

test().catch(console.error);