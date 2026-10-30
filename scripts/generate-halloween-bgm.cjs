const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050; // 22.05 kHz for rich Gothic vintage tone
const BPM = 88; // Slower, menacing, majestic tempo
const BEAT_DURATION = 60 / BPM; // ~0.6818s per beat
const TOTAL_BARS = 8;
const BEATS_PER_BAR = 4;
const TOTAL_BEATS = TOTAL_BARS * BEATS_PER_BAR; // 32 beats = ~21.82s loop
const TOTAL_DURATION = TOTAL_BEATS * BEAT_DURATION;
const TOTAL_SAMPLES = Math.floor(SAMPLE_RATE * TOTAL_DURATION);

console.log(`Generating Spooky Halloween Organ BGM: ${TOTAL_BARS} bars, ${BPM} BPM, ${TOTAL_DURATION.toFixed(2)}s`);

const master = new Float32Array(TOTAL_SAMPLES);

// Note frequencies in Hz
const N = {
  D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, C3: 130.81, Csharp3: 138.59,
  D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, C4: 261.63, Csharp4: 277.18,
  D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16, C5: 523.25, Csharp5: 554.37,
  D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, Bb5: 932.33,
  D6: 1174.66
};

// 1. Gothic Church Pipe Organ Synthesizer
// Additive synthesis modeling 8', 4', 2-2/3', 2' organ stops with tremulant
function addOrganChord(freqs, startSec, durSec, volume = 0.16) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const numSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < numSamples; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;

    // Organ pipe attack & release envelope
    const attack = Math.min(1, t / 0.04);
    const release = Math.min(1, (durSec - t) / 0.06);
    const env = attack * release;

    // Organ Tremulant (5.8 Hz gentle modulation)
    const trem = 1.0 + 0.012 * Math.sin(2 * Math.PI * 5.8 * t);

    let chordSum = 0;
    for (const baseFreq of freqs) {
      const f = baseFreq * trem;
      // 8' principal stop (fundamental)
      const h1 = Math.sin(2 * Math.PI * f * t);
      // 4' octave stop
      const h2 = 0.55 * Math.sin(2 * Math.PI * (2 * f) * t);
      // 2 2/3' nazard (quint)
      const h3 = 0.3 * Math.sin(2 * Math.PI * (3 * f) * t);
      // 2' superoctave stop
      const h4 = 0.2 * Math.sin(2 * Math.PI * (4 * f) * t);
      // 1 3/5' tierce (adds vintage Gothic reed buzz)
      const h5 = 0.12 * Math.sin(2 * Math.PI * (5 * f) * t);

      chordSum += (h1 + h2 + h3 + h4 + h5) / freqs.length;
    }

    master[idx] += chordSum * env * volume;
  }
}

// 2. Heavy Sub Bass Pedal (32' & 16' Contrabombarde Organ Foot Pedal)
function addPedalBass(freq, startSec, durSec, volume = 0.22) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const numSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < numSamples; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.03);
    const release = Math.min(1, (durSec - t) / 0.08);
    const env = attack * release;

    // Deep sub-octave fundamental + sub-harmonic
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = 0.45 * Math.sin(2 * Math.PI * (freq * 2) * t);
    const s3 = 0.2 * Math.sin(2 * Math.PI * (freq * 0.5) * t);

    master[idx] += (s1 + s2 + s3) * env * volume;
  }
}

// 3. Spooky Gothic Arpeggios (Toccata flourishes in upper register)
function addOrganLead(freq, startSec, durSec, volume = 0.14) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const numSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < numSamples; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.02);
    const release = Math.min(1, (durSec - t) / 0.04);
    const env = attack * release;

    // Shimmering reed stop
    const trem = 1.0 + 0.015 * Math.sin(2 * Math.PI * 6.2 * t);
    const f = freq * trem;
    const s1 = Math.sin(2 * Math.PI * f * t);
    const s2 = 0.4 * Math.sin(2 * Math.PI * (2 * f) * t);
    const s3 = 0.2 * Math.sin(2 * Math.PI * (3 * f) * t);

    master[idx] += (s1 + s2 + s3) * env * volume;
  }
}

// 4. Composition: 8-bar Classic Gothic Theme (D Minor)
const b = BEAT_DURATION;

// --- Chords & Pedal Bass ---
// Bar 1 & 2: D Minor (Menacing, powerful)
addPedalBass(N.D2, 0 * b, 4 * b);
addOrganChord([N.D3, N.A3, N.F4, N.D5], 0 * b, 3.8 * b);
addPedalBass(N.D2, 4 * b, 4 * b);
addOrganChord([N.D3, N.A3, N.F4, N.A4], 4 * b, 3.8 * b);

// Bar 3 & 4: G Minor (Dark suspense)
addPedalBass(N.G2, 8 * b, 4 * b);
addOrganChord([N.G3, N.Bb3, N.D4, N.G4], 8 * b, 3.8 * b);
addPedalBass(N.G2, 12 * b, 4 * b);
addOrganChord([N.G3, N.Bb3, N.D4, N.Bb4], 12 * b, 3.8 * b);

// Bar 5: Bb Major (Gothic triumph)
addPedalBass(N.Bb2, 16 * b, 4 * b);
addOrganChord([N.Bb3, N.D4, N.F4, N.D5], 16 * b, 3.8 * b);

// Bar 6: C# Diminished (Spooky tension)
addPedalBass(N.Csharp3, 20 * b, 4 * b);
addOrganChord([N.Csharp4, N.E4, N.G4, N.Bb4], 20 * b, 3.8 * b);

// Bar 7: A7 (Dominant suspense)
addPedalBass(N.A2, 24 * b, 4 * b);
addOrganChord([N.A3, N.Csharp4, N.E4, N.G4, N.A4], 24 * b, 3.8 * b);

// Bar 8: D Minor Resolution (Grand, leads seamlessly into Bar 1 loop)
addPedalBass(N.D2, 28 * b, 4 * b);
addOrganChord([N.D3, N.A3, N.F4, N.D5], 28 * b, 3.8 * b);

// --- Upper Toccata Arpeggio Flourishes ---
// Motif 1 (Bars 1-2): D minor descent & rise
const motif1 = [
  { n: N.D5, t: 0.0 * b }, { n: N.Csharp5, t: 0.5 * b }, { n: N.D5, t: 1.0 * b },
  { n: N.A4, t: 1.5 * b }, { n: N.F4, t: 2.0 * b }, { n: N.D4, t: 2.5 * b },
  { n: N.E4, t: 3.0 * b }, { n: N.F4, t: 3.5 * b },
  { n: N.G4, t: 4.0 * b }, { n: N.F4, t: 4.5 * b }, { n: N.E4, t: 5.0 * b },
  { n: N.D4, t: 5.5 * b }, { n: N.Csharp4, t: 6.0 * b }, { n: N.E4, t: 6.5 * b },
  { n: N.D4, t: 7.0 * b }
];
motif1.forEach(m => addOrganLead(m.n, m.t, 0.45 * b));

// Motif 2 (Bars 3-4): G minor climb
const motif2 = [
  { n: N.G4, t: 8.0 * b }, { n: N.Bb4, t: 8.5 * b }, { n: N.D5, t: 9.0 * b },
  { n: N.C5, t: 9.5 * b }, { n: N.Bb4, t: 10.0 * b }, { n: N.A4, t: 10.5 * b },
  { n: N.G4, t: 11.0 * b }, { n: N.Bb4, t: 11.5 * b },
  { n: N.D5, t: 12.0 * b }, { n: N.E5, t: 12.5 * b }, { n: N.F5, t: 13.0 * b },
  { n: N.E5, t: 13.5 * b }, { n: N.D5, t: 14.0 * b }, { n: N.C5, t: 14.5 * b },
  { n: N.Bb4, t: 15.0 * b }
];
motif2.forEach(m => addOrganLead(m.n, m.t, 0.45 * b));

// Motif 3 (Bars 5-6): Bb -> C# dim crescendo
const motif3 = [
  { n: N.F5, t: 16.0 * b }, { n: N.D5, t: 16.5 * b }, { n: N.Bb4, t: 17.0 * b },
  { n: N.D5, t: 17.5 * b }, { n: N.F5, t: 18.0 * b }, { n: N.Bb5, t: 18.5 * b },
  { n: N.A5, t: 19.0 * b }, { n: N.G5, t: 19.5 * b },
  { n: N.G5, t: 20.0 * b }, { n: N.E5, t: 20.5 * b }, { n: N.Csharp5, t: 21.0 * b },
  { n: N.Bb4, t: 21.5 * b }, { n: N.G4, t: 22.0 * b }, { n: N.Bb4, t: 22.5 * b },
  { n: N.Csharp5, t: 23.0 * b }
];
motif3.forEach(m => addOrganLead(m.n, m.t, 0.45 * b));

// Motif 4 (Bars 7-8): A7 dramatic cascade into final D minor chord
const motif4 = [
  { n: N.E5, t: 24.0 * b }, { n: N.Csharp5, t: 24.5 * b }, { n: N.A4, t: 25.0 * b },
  { n: N.G4, t: 25.5 * b }, { n: N.F4, t: 26.0 * b }, { n: N.E4, t: 26.5 * b },
  { n: N.D4, t: 27.0 * b }, { n: N.Csharp4, t: 27.5 * b },
  { n: N.D4, t: 28.0 * b }, { n: N.F4, t: 28.5 * b }, { n: N.A4, t: 29.0 * b },
  { n: N.D5, t: 29.5 * b }, { n: N.F5, t: 30.0 * b }, { n: N.D5, t: 30.5 * b }
];
motif4.forEach(m => addOrganLead(m.n, m.t, 0.45 * b));

// 5. Cathedral Reverb / Schroeder-Moorer Delay Network for gothic hall acoustics
console.log('Applying Cathedral Hall Reverb...');
const delays = [
  Math.floor(0.043 * SAMPLE_RATE),
  Math.floor(0.067 * SAMPLE_RATE),
  Math.floor(0.091 * SAMPLE_RATE),
  Math.floor(0.127 * SAMPLE_RATE)
];
const feedback = [0.42, 0.38, 0.33, 0.28];

for (let d = 0; d < delays.length; d++) {
  const delay = delays[d];
  const fb = feedback[d];
  for (let i = delay; i < TOTAL_SAMPLES; i++) {
    master[i] += master[i - delay] * fb * 0.25;
  }
}

// 6. Master Limiting & Soft-Clipping
console.log('Normalizing and mastering audio...');
let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const abs = Math.abs(master[i]);
  if (abs > maxPeak) maxPeak = abs;
}

const targetPeak = 0.88;
const gain = maxPeak > 0 ? targetPeak / maxPeak : 1;

// 7. Write 16-bit PCM WAV File
const numChannels = 1; // Mono for optimal filesize and clean looping
const bytesPerSample = 2;
const dataSize = TOTAL_SAMPLES * numChannels * bytesPerSample;
const headerSize = 44;
const totalSize = headerSize + dataSize;
const wavBuffer = Buffer.alloc(totalSize);

// RIFF header
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(totalSize - 8, 4);
wavBuffer.write('WAVE', 8);

// fmt sub-chunk
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16); // subchunk1 size
wavBuffer.writeUInt16LE(1, 20); // PCM
wavBuffer.writeUInt16LE(numChannels, 22);
wavBuffer.writeUInt32LE(SAMPLE_RATE, 24);
wavBuffer.writeUInt32LE(SAMPLE_RATE * numChannels * bytesPerSample, 28); // byte rate
wavBuffer.writeUInt16LE(numChannels * bytesPerSample, 32); // block align
wavBuffer.writeUInt16LE(16, 34); // bits per sample

// data sub-chunk
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  // Soft saturation
  let s = master[i] * gain;
  s = Math.max(-1, Math.min(1, Math.tanh(s * 1.1)));
  const int16 = Math.floor(s * 32767);
  wavBuffer.writeInt16LE(int16, offset);
  offset += 2;
}

const outputPath = path.join(__dirname, '../public/sounds/bgm-halloween.wav');
fs.writeFileSync(outputPath, wavBuffer);
console.log(`Saved Spooky Halloween BGM to ${outputPath} (${(wavBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
