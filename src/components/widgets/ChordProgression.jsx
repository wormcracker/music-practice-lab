import React from "react";

const KEYS = ["C","G","D","A","E","B","F#","C#","F","Bb","Eb","Ab","Db","Gb","Cb"];
const QUALITIES = ["Major","Minor"];
const DEGREE_SETS = {
  Major: ["I","ii","iii","IV","V","vi"],
  Minor: ["i","ii°","III","iv","v","VI","VII"],
};

const ChordProgression = ({ keyRoot: keyProp, quality: qualProp, steps: stepsProp, onUpdateWidgetProps }) => {
  const [keyRoot, setKeyRoot] = React.useState(keyProp ?? "C");
  const [quality, setQuality] = React.useState(qualProp ?? "Major");
  const [progression, setProgression] = React.useState([]);
  const [steps, setSteps] = React.useState(stepsProp ?? 4);

  const generate = () => {
    const pool = DEGREE_SETS[quality] || DEGREE_SETS.Major;
    const seq = Array.from({ length: steps }, () => pool[Math.floor(Math.random() * pool.length)]);
    setProgression(seq);
  };

  React.useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") onUpdateWidgetProps({ keyRoot, quality, steps });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyRoot, quality, steps]);

  return (
    <div className="max-w-sm p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center">
      <h2 className="text-2xl font-semibold mb-4">Chord Progression</h2>
      <div className="grid grid-cols-3 gap-3 mb-4 text-left">
        <div>
          <label className="block text-sm mb-1">Key</label>
          <select value={keyRoot} onChange={(e) => setKeyRoot(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
            {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Quality</label>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
            {QUALITIES.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Steps</label>
          <input type="number" min={2} max={8} value={steps} onChange={(e) => setSteps(Math.max(2, Math.min(8, Number(e.target.value))))} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1" />
        </div>
      </div>

      <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium mb-4" onClick={generate}>Generate</button>

      <div className="text-lg font-mono">
        {progression.length > 0 ? progression.join(" - ") : "—"}
      </div>
    </div>
  );
};

export default ChordProgression;


