import React from "react";

const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const INTERVALS = [
  { name: "m2", semitones: 1 },
  { name: "M2", semitones: 2 },
  { name: "m3", semitones: 3 },
  { name: "M3", semitones: 4 },
  { name: "P4", semitones: 5 },
  { name: "TT", semitones: 6 },
  { name: "P5", semitones: 7 },
  { name: "m6", semitones: 8 },
  { name: "M6", semitones: 9 },
  { name: "m7", semitones: 10 },
  { name: "M7", semitones: 11 },
  { name: "P8", semitones: 12 },
];

const toFreq = (noteIndex, baseIndex = 9, baseFreq = 440) => {
  const semis = noteIndex - baseIndex;
  return baseFreq * Math.pow(2, semis / 12);
};

const IntervalTrainer = ({ root: rootProp, intervalName: intProp, onUpdateWidgetProps }) => {
  const [root, setRoot] = React.useState(rootProp ?? "A");
  const [intervalName, setIntervalName] = React.useState(intProp ?? "P5");
  const audioCtxRef = React.useRef(null);

  const ensure = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtxRef.current;
  };

  const play = async () => {
    const ctx = ensure();
    const g = ctx.createGain();
    g.gain.value = 0.0;
    g.connect(ctx.destination);

    const rIdx = NOTES.indexOf(root);
    const int = INTERVALS.find((x) => x.name === intervalName) || INTERVALS[6];

    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = toFreq(rIdx);
    o1.connect(g);

    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = toFreq(rIdx + int.semitones);
    o2.connect(g);

    const now = ctx.currentTime;
    const dur = 0.5;
    const gap = 0.1;

    // first note
    o1.start(now);
    g.gain.setTargetAtTime(0.3, now, 0.02);
    g.gain.setTargetAtTime(0.0, now + dur, 0.06);

    // second note after gap
    const start2 = now + dur + gap;
    o2.start(start2);
    g.gain.setTargetAtTime(0.3, start2, 0.02);
    g.gain.setTargetAtTime(0.0, start2 + dur, 0.06);

    // cleanup
    setTimeout(() => {
      try { o1.stop(); o2.stop(); g.disconnect(); } catch {}
    }, Math.ceil((dur * 2 + gap + 0.2) * 1000));
  };

  React.useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") onUpdateWidgetProps({ root, intervalName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, intervalName]);

  return (
    <div className="max-w-sm p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Interval Trainer</h2>
      <div className="grid grid-cols-2 gap-4 mb-4 text-left">
        <div>
          <label className="block text-sm mb-1">Root</label>
          <select value={root} onChange={(e) => setRoot(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
            {NOTES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Interval</label>
          <select value={intervalName} onChange={(e) => setIntervalName(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
            {INTERVALS.map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
          </select>
        </div>
      </div>
      <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium" onClick={play}>Play</button>
    </div>
  );
};

export default IntervalTrainer;


