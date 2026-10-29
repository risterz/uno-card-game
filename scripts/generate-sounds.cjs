const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function createWavBuffer(samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF identifier
  buffer.write('RIFF', 0);
  // File length minus 8
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  // RIFF type
  buffer.write('WAVE', 8);
  // Format chunk identifier
  buffer.write('fmt ', 12);
  // Format chunk length
  buffer.writeUInt32LE(16, 16);
  // Sample format (1 = PCM)
  buffer.writeUInt16LE(1, 20);
  // Channel count (1 = mono)
  buffer.writeUInt16LE(1, 22);
  // Sample rate
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  // Block align (NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(2, 32);
  // Bits per sample
  buffer.writeUInt16LE(16, 34);
  // Data chunk identifier
  buffer.write('data', 36);
  // Data chunk length
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = s < 0 ? s * 32768 : s * 32767;
    buffer.writeInt16LE(Math.round(intVal), 44 + i * 2);
  }

  return buffer;
}

// 1. Victory Fanfare Sound ('win.wav')
function generateWinSound() {
  const duration = 2.2;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // Arpeggio notes: C4, E4, G4, C5, E5, G5, held triumphant C5+E5+G5 chord
  const notes = [
    { freq: 261.63, start: 0.00, end: 0.14 },
    { freq: 329.63, start: 0.12, end: 0.26 },
    { freq: 392.00, start: 0.24, end: 0.38 },
    { freq: 523.25, start: 0.36, end: 0.52 },
    { freq: 659.25, start: 0.50, end: 0.68 },
    { freq: 783.99, start: 0.66, end: 2.15 }, // High G5
    { freq: 523.25, start: 0.66, end: 2.15 }, // Chord root C5
    { freq: 659.25, start: 0.66, end: 2.15 }, // Chord third E5
    { freq: 1046.5, start: 0.70, end: 2.00 }, // Sparkle octave C6
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;

    for (const n of notes) {
      if (t >= n.start && t <= n.end) {
        const localT = t - n.start;
        const dur = n.end - n.start;
        // Envelope: quick attack, sustained or decaying
        let env;
        if (n.end > 2.0) {
          // Held chord with decay
          const attack = Math.min(1, localT / 0.05);
          const decay = Math.max(0, 1 - (localT / dur));
          env = attack * Math.pow(decay, 0.85);
        } else {
          // Fast note
          const attack = Math.min(1, localT / 0.015);
          const decay = Math.max(0, 1 - (localT / dur));
          env = attack * Math.pow(decay, 1.4);
        }

        // Trumpet/horn style harmonics (fundamental + 2nd + 3rd harmonic)
        const fundamental = Math.sin(2 * Math.PI * n.freq * localT);
        const h2 = 0.4 * Math.sin(2 * Math.PI * (n.freq * 2) * localT);
        const h3 = 0.2 * Math.sin(2 * Math.PI * (n.freq * 3) * localT);
        val += (fundamental + h2 + h3) * env * 0.18;
      }
    }

    // Add subtle shimmer/bell ring
    if (t >= 0.7) {
      const bellT = t - 0.7;
      const bellEnv = Math.exp(-bellT * 2.5);
      val += Math.sin(2 * Math.PI * 1567.98 * bellT) * 0.06 * bellEnv;
      val += Math.sin(2 * Math.PI * 2093.00 * bellT) * 0.04 * bellEnv;
    }

    samples[i] = val;
  }

  return samples;
}

// 2. Card Play Snap Sound ('card.wav')
function generateCardSound() {
  const duration = 0.12;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 45); // Sharp punchy decay

    // Rapid pitch drop pop
    const freq = 550 * Math.exp(-t * 28) + 120;
    const tone = Math.sin(2 * Math.PI * freq * t);

    // Friction paper noise
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 60);

    samples[i] = (tone * 0.7 + noise * 0.5) * env * 0.45;
  }
  return samples;
}

// 3. Card Draw Slide Sound ('draw.wav')
function generateDrawSound() {
  const duration = 0.22;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Envelope swells and fades
    const env = Math.sin((t / duration) * Math.PI);

    // Filtered swoosh noise sweeping frequency
    const noise = Math.random() * 2 - 1;
    const sweepFreq = 600 + 800 * (t / duration);
    const wave = Math.sin(2 * Math.PI * sweepFreq * t);

    // Final subtle card release tick
    const tick = t > 0.16 ? Math.sin(2 * Math.PI * 400 * t) * Math.exp(-(t - 0.16) * 50) : 0;

    samples[i] = (noise * 0.4 + wave * 0.3 + tick * 0.5) * env * 0.35;
  }
  return samples;
}

// 4. Action Card Sound ('action.wav')
function generateActionSound() {
  const duration = 0.32;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Upward energetic dual-tone zap
    const freq1 = 280 + 900 * Math.pow(t / duration, 0.7);
    const freq2 = 420 + 1200 * Math.pow(t / duration, 0.7);
    const env = Math.sin((t / duration) * Math.PI * 0.9) * Math.exp(-t * 3.5);

    const tone1 = Math.sin(2 * Math.PI * freq1 * t);
    const tone2 = 0.4 * Math.sin(2 * Math.PI * freq2 * t);
    samples[i] = (tone1 + tone2) * env * 0.38;
  }
  return samples;
}

// 5. Wild Card Shimmer ('wild.wav')
function generateWildSound() {
  const duration = 0.65;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // 4 shimmering notes (D5, F#5, A5, C#6)
  const freqs = [587.33, 739.99, 880.00, 1108.73];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin((t / duration) * Math.PI) * Math.exp(-t * 1.5);
    let val = 0;

    freqs.forEach((f, idx) => {
      // Tremolo oscillation
      const tremolo = 1 + 0.25 * Math.sin(2 * Math.PI * (8 + idx * 2) * t);
      val += Math.sin(2 * Math.PI * f * t) * tremolo * 0.2;
    });

    samples[i] = val * env * 0.4;
  }
  return samples;
}

// 6. UNO Shout Brass Fanfare ('uno.wav')
function generateUnoSound() {
  const duration = 0.75;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;

    if (t < 0.22) {
      // Note 1: G4 (392 Hz)
      const env = Math.min(1, t / 0.02) * Math.exp(-t * 2.5);
      const s1 = Math.sin(2 * Math.PI * 392 * t);
      const s2 = 0.5 * Math.sin(2 * Math.PI * 784 * t);
      val = (s1 + s2) * env * 0.35;
    } else {
      // Note 2: C5 (523.25 Hz) bold punch
      const t2 = t - 0.22;
      const env = Math.min(1, t2 / 0.02) * Math.exp(-t2 * 2.2);
      const s1 = Math.sin(2 * Math.PI * 523.25 * t2);
      const s2 = 0.6 * Math.sin(2 * Math.PI * 1046.5 * t2);
      const s3 = 0.3 * Math.sin(2 * Math.PI * 1569.75 * t2);
      val = (s1 + s2 + s3) * env * 0.45;
    }

    samples[i] = val;
  }
  return samples;
}

// 7. UNO Catch Buzzer Siren ('catch.wav')
function generateCatchSound() {
  const duration = 0.45;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Rapid alternating siren alarm
    const cycle = Math.floor(t * 16) % 2;
    const freq = cycle === 0 ? 880 : 587;
    const env = Math.exp(-t * 3.5);

    // Rich alarm tone
    const wave = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.3 : -0.3;
    samples[i] = wave * env * 0.45;
  }
  return samples;
}

// 8. Match Start Chime ('start.wav')
function generateStartSound() {
  const duration = 0.6;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // Ascending 3 bells (C5, E5, G5)
  const notes = [
    { freq: 523.25, time: 0.0 },
    { freq: 659.25, time: 0.12 },
    { freq: 783.99, time: 0.24 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;

    for (const n of notes) {
      if (t >= n.time) {
        const localT = t - n.time;
        const env = Math.exp(-localT * 7);
        val += Math.sin(2 * Math.PI * n.freq * localT) * env * 0.25;
        val += Math.sin(2 * Math.PI * (n.freq * 2) * localT) * env * 0.1;
      }
    }

    samples[i] = val;
  }
  return samples;
}

// Write out all files
const soundsDir = path.join(__dirname, '..', 'public', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

const sounds = {
  'win.wav': generateWinSound(),
  'card.wav': generateCardSound(),
  'draw.wav': generateDrawSound(),
  'action.wav': generateActionSound(),
  'wild.wav': generateWildSound(),
  'uno.wav': generateUnoSound(),
  'catch.wav': generateCatchSound(),
  'start.wav': generateStartSound(),
};

for (const [filename, samples] of Object.entries(sounds)) {
  const filePath = path.join(soundsDir, filename);
  const buffer = createWavBuffer(samples);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Generated: public/sounds/${filename} (${buffer.length} bytes, ${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}

console.log('\n🎉 ALL 8 HIGH QUALITY SOUND EFFECTS GENERATED SUCCESSFULLY!');
