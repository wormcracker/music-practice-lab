import React, { useState } from "react";

const ROOT_NOTES = [
  "C",
  "C♯/D♭",
  "D",
  "D♯/E♭",
  "E",
  "F",
  "F♯/G♭",
  "G",
  "G♯/A♭",
  "A",
  "A♯/B♭",
  "B",
];

const SCALE_TYPES = [
  "Major",
  "Natural Minor",
  "Harmonic Minor",
  "Melodic Minor",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Locrian",
  "Pentatonic Major",
  "Pentatonic Minor",
  "Blues",
];

const RandomScaleGenerator = ({ history: historyProp, onUpdateWidgetProps }) => {
  const [currentScale, setCurrentScale] = useState(null);
  const [history, setHistory] = useState(historyProp ?? []);

  const generateScale = () => {
    const root = ROOT_NOTES[Math.floor(Math.random() * ROOT_NOTES.length)];
    const type = SCALE_TYPES[Math.floor(Math.random() * SCALE_TYPES.length)];
    const scale = `${root} ${type}`;
    setCurrentScale(scale);
    setHistory((prev) => [scale, ...prev.slice(0, 4)]);
  };

  React.useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") {
      onUpdateWidgetProps({ history });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <div className="max-w-sm p-6 rounded-xl text-center shadow-lg font-sans bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Random Scale Generator</h2>
      <div className="text-3xl font-bold mb-2">{currentScale || "-"}</div>
      <button
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition mb-4"
        onClick={generateScale}
      >
        Next Scale
      </button>
      <div className="text-sm opacity-70 mt-2">
        <div className="font-semibold mb-1">Recent Scales:</div>
        <ul className="space-y-1">
          {history.map((scale, idx) => (
            <li key={idx}>{scale}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RandomScaleGenerator;
