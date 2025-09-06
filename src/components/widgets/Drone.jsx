import React from "react";

const frequencies = {
  C: 261.63,
  "C#": 277.18,
  D: 293.66,
  "D#": 311.13,
  E: 329.63,
  F: 349.23,
  "F#": 369.99,
  G: 392.0,
  "G#": 415.3,
  A: 440.0,
  "A#": 466.16,
  B: 493.88,
};

const Drone = ({ note: noteProp, volume: volProp, waveform: waveProp, detuneCents: detuneProp, cutoffHz: cutoffProp, onUpdateWidgetProps }) => {
  const [note, setNote] = React.useState(noteProp ?? "A");
  const [volume, setVolume] = React.useState(volProp ?? 0.15);
  const [waveform, setWaveform] = React.useState(waveProp ?? "sine");
  const [detuneCents, setDetuneCents] = React.useState(detuneProp ?? 4);
  const [cutoffHz, setCutoffHz] = React.useState(cutoffProp ?? 1200);
  const [isOn, setIsOn] = React.useState(false);
  const audioCtxRef = React.useRef(null);
  const oscARef = React.useRef(null);
  const oscBRef = React.useRef(null);
  const gainRef = React.useRef(null);
  const filterRef = React.useRef(null);

  const ensureAudio = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (!gainRef.current) {
      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = 0.0;
    }
    if (!filterRef.current) {
      filterRef.current = audioCtxRef.current.createBiquadFilter();
      filterRef.current.type = "lowpass";
      filterRef.current.frequency.value = cutoffHz;
      gainRef.current.connect(filterRef.current);
      filterRef.current.connect(audioCtxRef.current.destination);
    }
    if (!oscARef.current) {
      oscARef.current = audioCtxRef.current.createOscillator();
      oscARef.current.type = waveform;
      oscARef.current.frequency.value = frequencies[note] || 440;
      oscARef.current.connect(gainRef.current);
      oscARef.current.start();
    }
    if (!oscBRef.current) {
      oscBRef.current = audioCtxRef.current.createOscillator();
      oscBRef.current.type = waveform;
      oscBRef.current.frequency.value = frequencies[note] || 440;
      oscBRef.current.detune.value = detuneCents;
      oscBRef.current.connect(gainRef.current);
      oscBRef.current.start();
    }
  };

  const start = () => {
    ensureAudio();
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    gainRef.current.gain.cancelScheduledValues(now);
    gainRef.current.gain.setTargetAtTime(volume, now, 0.05); // soft attack
    setIsOn(true);
  };

  const stop = () => {
    const ctx = audioCtxRef.current;
    if (ctx && gainRef.current) {
      const now = ctx.currentTime;
      gainRef.current.gain.cancelScheduledValues(now);
      gainRef.current.gain.setTargetAtTime(0.0, now, 0.06); // smooth release
    }
    setIsOn(false);
  };

  React.useEffect(() => {
    if (!oscARef.current || !oscBRef.current) return;
    const ctx = audioCtxRef.current;
    const freq = frequencies[note] || 440;
    oscARef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.01);
    oscBRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.01);
  }, [note]);

  React.useEffect(() => {
    if (!gainRef.current) return;
    const ctx = audioCtxRef.current;
    gainRef.current.gain.setTargetAtTime(isOn ? volume : 0.0, ctx.currentTime, 0.05);
  }, [isOn, volume]);

  React.useEffect(() => {
    if (!oscARef.current || !oscBRef.current) return;
    oscARef.current.type = waveform;
    oscBRef.current.type = waveform;
  }, [waveform]);

  React.useEffect(() => {
    if (!oscBRef.current) return;
    oscBRef.current.detune.setTargetAtTime(detuneCents, audioCtxRef.current.currentTime, 0.02);
  }, [detuneCents]);

  React.useEffect(() => {
    if (!filterRef.current) return;
    filterRef.current.frequency.setTargetAtTime(cutoffHz, audioCtxRef.current.currentTime, 0.02);
  }, [cutoffHz]);

  React.useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") onUpdateWidgetProps({ note, volume, waveform, detuneCents, cutoffHz });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, volume, waveform, detuneCents, cutoffHz]);

  React.useEffect(() => () => {
    try {
      oscARef.current && oscARef.current.stop();
      oscBRef.current && oscBRef.current.stop();
      audioCtxRef.current && audioCtxRef.current.close();
    } catch {}
  }, []);

  return (
    <div className="max-w-sm p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Drone</h2>
      <div className="grid grid-cols-2 gap-4 mb-4 text-left">
        <div>
          <label className="block text-sm mb-1">Note</label>
          <select
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            {Object.keys(frequencies).map((n) => (
              <option key={n} value={n}>{n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Waveform</label>
          <select value={waveform} onChange={(e) => setWaveform(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
            {['sine','triangle','sawtooth'].map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Detune (cents)</label>
          <input type="range" min="0" max="20" step="1" value={detuneCents} onChange={(e) => setDetuneCents(Number(e.target.value))} className="w-full" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1">Tone (Low-pass cutoff)</label>
          <input type="range" min="300" max="6000" step="50" value={cutoffHz} onChange={(e) => setCutoffHz(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex gap-3">
        {!isOn ? (
          <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white" onClick={start}>Start</button>
        ) : (
          <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white" onClick={stop}>Stop</button>
        )}
      </div>
    </div>
  );
};

export default Drone;


