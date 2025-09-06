import React, { useRef, useState, useEffect } from "react";
import { Mic, MicOff, BookAudio as TuningFork } from "lucide-react";

// Note names for chromatic scale
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Get note name and octave from frequency
function freqToNote(freq) {
  if (!freq || freq < 20) return { note: "-", octave: "-", cents: 0, freq: 0 };
  const A4 = 440;
  const n = Math.round(12 * Math.log2(freq / A4));
  const noteIndex = (n + 9 + 12 * 100) % 12; // +9 to align A=0 to C=0
  const note = NOTE_NAMES[noteIndex];
  const octave = 4 + Math.floor((n + 9) / 12);
  const refFreq = A4 * Math.pow(2, n / 12);
  const cents = Math.round(1200 * Math.log2(freq / refFreq));
  return { note, octave, cents, freq: freq.toFixed(2) };
}

// Improved autocorrelation with parabolic interpolation and frequency limits
function autoCorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    let val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null; // Too quiet

  // Remove DC offset
  let mean = buf.reduce((a, b) => a + b, 0) / SIZE;
  for (let i = 0; i < SIZE; i++) buf[i] -= mean;

  let maxSamples = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorr = 0;
  let correlations = new Array(maxSamples);

  let minFreq = 40; // Hz (lowered for bass)
  let maxFreq = 1200; // Hz
  let minLag = Math.floor(sampleRate / maxFreq);
  let maxLag = Math.floor(sampleRate / minFreq);

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < maxSamples; i++) {
      corr += buf[i] * buf[i + lag];
    }
    correlations[lag] = corr;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestOffset = lag;
    }
  }

  // Parabolic interpolation for better accuracy
  if (bestOffset > minLag && bestOffset < maxLag) {
    let y0 = correlations[bestOffset - 1];
    let y1 = correlations[bestOffset];
    let y2 = correlations[bestOffset + 1];
    let shift = (y2 - y0) / (2 * (2 * y1 - y2 - y0));
    bestOffset = bestOffset + shift;
  }

  let freq = sampleRate / bestOffset;
  if (freq < minFreq || freq > maxFreq) return null;
  return freq;
}

const Tuner = ({ showVisualizer = false, onUpdateWidgetProps }) => {
  const [isListening, setIsListening] = useState(false);
  const [detected, setDetected] = useState({
    note: "-",
    octave: "-",
    cents: 0,
    freq: 0,
  });
  const [lastDetected, setLastDetected] = useState({
    note: "-",
    octave: "-",
    cents: 0,
    freq: 0,
  });
  const [error, setError] = useState("");
  const [visualizerData, setVisualizerData] = useState(new Array(64).fill(0));
  const [localShowVisualizer, setLocalShowVisualizer] =
    useState(showVisualizer);
  const [smoothedFreq, setSmoothedFreq] = useState(0);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  // Initialize from props
  useEffect(() => {
    setLocalShowVisualizer(showVisualizer);
  }, [showVisualizer]);

  // Start microphone
  const startMic = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 16384; // Larger for better low note detection
      source.connect(analyserRef.current);
      setIsListening(true);
      listen();
    } catch (e) {
      setError("Microphone access denied or unavailable.");
    }
  };

  // Stop microphone
  const stopMic = () => {
    setIsListening(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setDetected({ note: "-", octave: "-", cents: 0, freq: 0 });
    setLastDetected({ note: "-", octave: "-", cents: 0, freq: 0 });
    setSmoothedFreq(0);
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  };

  // Listen and detect pitch
  const listen = () => {
    const analyser = analyserRef.current;
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);

    // Update visualizer data
    if (localShowVisualizer) {
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);
      setVisualizerData(Array.from(freqData.slice(0, 64))); // First 64 frequency bins
    }

    const freq = autoCorrelate(buf, audioCtxRef.current.sampleRate);

    // Octave correction for guitar/bass
    let correctedFreq = freq;
    if (freq) {
      // If above A2, check for subharmonics (divide by 2 or 3)
      if (freq > 110) {
        if (freq / 2 > 40 && freq / 2 < 120) {
          correctedFreq = freq / 2;
        } else if (freq / 3 > 40 && freq / 3 < 120) {
          correctedFreq = freq / 3;
        }
      }
    }

    // Smoothing
    const SMOOTHING = 0.2; // 0 = no smoothing, 1 = infinite smoothing
    let displayFreq = correctedFreq;
    if (correctedFreq) {
      displayFreq = smoothedFreq
        ? SMOOTHING * smoothedFreq + (1 - SMOOTHING) * correctedFreq
        : correctedFreq;
      setSmoothedFreq(displayFreq);
      const noteObj = freqToNote(displayFreq);
      setDetected(noteObj);
      setLastDetected(noteObj);
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    } else {
      setDetected({ note: "-", octave: "-", cents: 0, freq: 0 });
      if (!fadeTimeoutRef.current) {
        fadeTimeoutRef.current = setTimeout(() => {
          setLastDetected({ note: "-", octave: "-", cents: 0, freq: 0 });
          fadeTimeoutRef.current = null;
        }, 2000); // 2 seconds grace period
      }
    }
    rafRef.current = requestAnimationFrame(listen);
  };

  // Play reference tone
  const playTone = (freq) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
    osc.onended = () => ctx.close();
  };

  // Chromatic notes for reference
  const chromatic = Array.from({ length: 12 }, (_, i) => {
    const note = NOTE_NAMES[i];
    const freq = 440 * Math.pow(2, (i - 9) / 12); // A4=440, C=0
    return { note, freq: freq.toFixed(2) };
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMic();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-sm p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex flex-col gap-4">
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-2">
        <TuningFork className="w-6 h-6 text-blue-500" /> Chromatic Tuner
      </h2>
      <div className="flex items-center gap-3">
        <button
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          onClick={isListening ? stopMic : startMic}
        >
          {isListening ? <MicOff /> : <Mic />}
          {isListening ? "Stop" : "Use Microphone"}
        </button>
        <span className="text-xs text-gray-500">
          {isListening ? "Listening..." : ""}
        </span>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex flex-col items-center my-2">
        <div className="text-5xl font-bold tracking-widest mb-1">
          {lastDetected.note}
          <span className="text-2xl font-normal ml-1">
            {lastDetected.octave}
          </span>
        </div>
        <div className="text-lg mb-1">
          {lastDetected.freq > 0 ? `${lastDetected.freq} Hz` : "—"}
        </div>
        <div className="text-sm">
          {lastDetected.note !== "-" && (
            <span
              className={
                Math.abs(lastDetected.cents) < 5
                  ? "text-green-600"
                  : lastDetected.cents < 0
                    ? "text-blue-600"
                    : "text-red-600"
              }
            >
              {lastDetected.cents > 0 ? "+" : ""}
              {lastDetected.cents} cents
              {Math.abs(lastDetected.cents) < 5
                ? " (in tune)"
                : lastDetected.cents < 0
                  ? " (flat)"
                  : " (sharp)"}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2">
        <div className="font-semibold mb-1 text-sm">
          Reference Tones (A4=440Hz):
        </div>
        <div className="grid grid-cols-6 gap-2">
          {chromatic.map((n, i) => (
            <button
              key={i}
              className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-mono"
              onClick={() => playTone(Number(n.freq))}
              title={`${n.freq} Hz`}
            >
              {n.note}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Visualizer */}
      {localShowVisualizer && isListening && (
        <div className="w-full mt-4">
          <div className="text-sm font-medium mb-2">Audio Visualizer</div>
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 flex items-end gap-0.5">
            {visualizerData.map((value, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm transition-all duration-100"
                style={{
                  width: "3px",
                  height: `${Math.max(2, (value / 255) * 100)}%`,
                  minHeight: "2px",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        Play a note on your instrument and watch the tuner detect pitch and show
        how sharp/flat you are.
      </div>
    </div>
  );
};

export default Tuner;

