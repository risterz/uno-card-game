const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050; // 22.05 kHz is warm, crisp for casual chiptune/lo-fi and keeps file compact (~1.5 MB)
const BPM = 104;
const BEAT_DURATION = 60 / BPM; // ~0.5769s per beat
const TOTAL_BARS = 8;
const BEATS_PER_BAR = 4;
const TOTAL_BEATS = TOTAL_BARS * BEATS_PER_BAR; // 32 beats = ~18.46s seamless loop
const TOTAL_DURATION = TOTAL_BEATS * BEAT_DURATION;
const TOTAL_SAMPLES = Math.floor(SAMPLE_RATE * TOTAL_DURATION);

console.log(`Generating Casual BGM: ${TOTAL_BARS} bars, ${BPM} BPM, ${TOTAL_DURATION.toFixed(2)}s, ${TOTAL_SAMPLES} samples`);

const master = new Float32Array(TOTAL_SAMPLES);

// Note frequencies (Hz)
const NOTES = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98
};

// 1. Pluck / Marimba synth
function addPluck(freq, startSec, durSec, volume = 0.25) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const numSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < numSamples; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 6.5); // Warm exponential pluck decay
    // Fundamental + gentle harmonic overtones
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = 0.35 * Math.sin(2 * Math.PI * (freq * 2.01) * t) * Math.exp(-t * 12);
    const s3 = 0.15 * Math.sin(2 * Math.PI * (freq * 3.0) * t) * Math.exp(-t * 18);
    const wave = (s1 + s2 + s3) * env * volume;
    master[idx] += wave;
  }
}

// 2. Warm Rhodes / Electric Piano Chord Pad
function addWarmPad(freqs, startSec, durSec, volume = 0.12) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const numSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < numSamples; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;
    // Attack-decay-sustain-release envelope
    const attack = Math.min(1, t / 0.08);
    const release = Math.min(1, (durSec - t) / 0.12);
    const env = attack * release * Math.exp(-t * 0.85);

    let chordSample = 0;
    for (const f of freqs) {
      // Sine + warm triangle/2nd harmonic with slight stereo detune feel
      const s1 = Math.sin(2 * Math.PI * f * t);
      const s2 = 0.25 * Math.sin(2 * Math.PI * f * 2.0 * t);
      chordSample += (s1 + s2);
    }
    master[idx] += (chordSample / freqs.length) * env * volume;
  }
}

// 3. Cozy Bouncy Bass
function addBass(freq, startSec, durSec, volume = 0.35) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const numSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < numSamples; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 4.2);
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = 0.4 * Math.sin(2 * Math.PI * (freq * 2) * t) * Math.exp(-t * 8);
    master[idx] += (s1 + s2) * env * volume;
  }
}

// 4. Soft Percussion (warm rimshot / woodblock / shaker)
function addPercussion(type, startSec, volume = 0.15) {
  const durSec = type === 'shaker' ? 0.06 : 0.1;
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const numSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < numSamples; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;
    let s = 0;
    if (type === 'shaker') {
      const whiteNoise = (Math.random() * 2 - 1);
      const env = Math.exp(-t * 50);
      s = whiteNoise * env * volume;
    } else if (type === 'kick') {
      const pEnv = Math.exp(-t * 30);
      const freq = 120 * pEnv + 45;
      s = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 15) * volume * 1.5;
    } else if (type === 'tap') {
      const env = Math.exp(-t * 40);
      s = Math.sin(2 * Math.PI * 680 * t) * env * volume;
    }
    master[idx] += s;
  }
}

// Chord Progressions across 8 Bars:
// Bar 1-2: Cmaj7 (C3, E3, G3, B3)
// Bar 3-4: Am7   (A2, C3, E3, G3)
// Bar 5-6: Fmaj7 (F2, A2, C3, E3)
// Bar 7:   Dm7   (D3, F3, A3, C4)
// Bar 8:   G7    (G2, B2, D3, F3)

const chordProgression = [
  { bar: 0, chord: [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.C2 },
  { bar: 1, chord: [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.G2 },
  { bar: 2, chord: [NOTES.A2, NOTES.C3, NOTES.E3, NOTES.G3], bass: NOTES.A2 },
  { bar: 3, chord: [NOTES.A2, NOTES.C3, NOTES.E3, NOTES.G3], bass: NOTES.E2 },
  { bar: 4, chord: [NOTES.F2, NOTES.A2, NOTES.C3, NOTES.E3], bass: NOTES.F2 },
  { bar: 5, chord: [NOTES.F2, NOTES.A2, NOTES.C3, NOTES.E3], bass: NOTES.C3 },
  { bar: 6, chord: [NOTES.D3, NOTES.F3, NOTES.A3, NOTES.C4], bass: NOTES.D2 },
  { bar: 7, chord: [NOTES.G2, NOTES.B2, NOTES.D3, NOTES.F3], bass: NOTES.G2 },
];

// Add chords & bass
chordProgression.forEach(({ bar, chord, bass }) => {
  const barStart = bar * 4 * BEAT_DURATION;
  // Two chord pulses per bar
  addWarmPad(chord, barStart, BEAT_DURATION * 1.8, 0.18);
  addWarmPad(chord, barStart + BEAT_DURATION * 2, BEAT_DURATION * 1.8, 0.18);

  // Bass on beat 1 and beat 3
  addBass(bass, barStart, BEAT_DURATION * 1.2, 0.32);
  addBass(bass, barStart + BEAT_DURATION * 2.5, BEAT_DURATION * 0.8, 0.25);
});

// Add light cozy percussion (Kick on 1, Tap on 3, Shaker on every 0.5 beat)
for (let beat = 0; beat < TOTAL_BEATS; beat++) {
  const beatTime = beat * BEAT_DURATION;
  if (beat % 4 === 0) {
    addPercussion('kick', beatTime, 0.22);
  } else if (beat % 4 === 2) {
    addPercussion('tap', beatTime, 0.16);
  }
  // Soft shakers
  addPercussion('shaker', beatTime, 0.08);
  addPercussion('shaker', beatTime + BEAT_DURATION * 0.5, 0.05);
}

// Cheerful, cozy melody line (Marimba / Kalimba plucks)
const melody = [
  // Bar 1 (Cmaj7)
  { beat: 0, note: NOTES.G4, dur: 0.6 },
  { beat: 1, note: NOTES.E4, dur: 0.5 },
  { beat: 2, note: NOTES.G4, dur: 0.5 },
  { beat: 3, note: NOTES.B4, dur: 0.8 },
  // Bar 2
  { beat: 4, note: NOTES.C5, dur: 1.0 },
  { beat: 5.5, note: NOTES.B4, dur: 0.4 },
  { beat: 6, note: NOTES.G4, dur: 0.8 },
  // Bar 3 (Am7)
  { beat: 8, note: NOTES.E4, dur: 0.6 },
  { beat: 9, note: NOTES.A4, dur: 0.5 },
  { beat: 10, note: NOTES.C5, dur: 0.6 },
  { beat: 11, note: NOTES.E5, dur: 0.8 },
  // Bar 4
  { beat: 12, note: NOTES.D5, dur: 1.2 },
  { beat: 14, note: NOTES.C5, dur: 0.8 },
  // Bar 5 (Fmaj7)
  { beat: 16, note: NOTES.A4, dur: 0.6 },
  { beat: 17, note: NOTES.C5, dur: 0.5 },
  { beat: 18, note: NOTES.F5, dur: 0.8 },
  { beat: 19.5, note: NOTES.E5, dur: 0.4 },
  // Bar 6
  { beat: 20, note: NOTES.D5, dur: 0.8 },
  { beat: 21, note: NOTES.C5, dur: 0.5 },
  { beat: 22, note: NOTES.A4, dur: 1.0 },
  // Bar 7 (Dm7)
  { beat: 24, note: NOTES.F4, dur: 0.6 },
  { beat: 25, note: NOTES.A4, dur: 0.5 },
  { beat: 26, note: NOTES.D5, dur: 0.8 },
  { beat: 27, note: NOTES.C5, dur: 0.6 },
  // Bar 8 (G7 turnaround)
  { beat: 28, note: NOTES.B4, dur: 0.6 },
  { beat: 29, note: NOTES.G4, dur: 0.5 },
  { beat: 30, note: NOTES.A4, dur: 0.4 },
  { beat: 31, note: NOTES.B4, dur: 0.6 },
];

melody.forEach(({ beat, note, dur }) => {
  const startSec = beat * BEAT_DURATION;
  addPluck(note, startSec, dur * BEAT_DURATION, 0.28);
  // Add subtle soft octave echo
  addPluck(note * 0.5, startSec, dur * BEAT_DURATION * 0.8, 0.10);
});

// Soft master limiter / normalization to avoid clipping
let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const val = Math.abs(master[i]);
  if (val > maxPeak) maxPeak = val;
}

const targetPeak = 0.85;
const gain = maxPeak > 0 ? targetPeak / maxPeak : 1;
console.log(`Peak detected: ${maxPeak.toFixed(3)}, Applying normalization gain: ${gain.toFixed(3)}`);

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  master[i] *= gain;
}

// Convert to 16-bit PCM WAV
function createWavBuffer(samples, sampleRate) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = s < 0 ? s * 32768 : s * 32767;
    buffer.writeInt16LE(Math.round(intVal), 44 + i * 2);
  }
  return buffer;
}

const wavBuffer = createWavBuffer(master, SAMPLE_RATE);
const outputPath = path.join(__dirname, '../public/sounds/bgm-casual.wav');
fs.writeFileSync(outputPath, wavBuffer);

console.log(`Saved BGM to ${outputPath} (${(wavBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
