import React from "react";

const TapTempo = ({ bpm: bpmProp, onUpdateWidgetProps }) => {
  const [bpm, setBpm] = React.useState(bpmProp ?? 120);
  const [tapTimes, setTapTimes] = React.useState([]);

  const handleTap = () => {
    const now = performance.now();
    setTapTimes((prev) => {
      const next = [...prev, now].slice(-8);
      if (next.length >= 2) {
        const intervals = [];
        for (let i = 1; i < next.length; i++) intervals.push(next[i] - next[i - 1]);
        const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const computedBpm = Math.round(60000 / avgMs);
        setBpm(Math.max(20, Math.min(300, computedBpm)));
      }
      return next;
    });
  };

  const handleReset = () => {
    setTapTimes([]);
  };

  React.useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") {
      onUpdateWidgetProps({ bpm });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);

  return (
    <div className="max-w-sm p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-center">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tap Tempo</h2>
      <div className="text-5xl font-bold mb-2 text-gray-900 dark:text-gray-100">{bpm}</div>
      <div className="text-sm opacity-70 mb-4">BPM</div>
      <div className="flex justify-center gap-3">
        <button
          className="px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          onClick={handleTap}
        >
          Tap
        </button>
      </div>
    </div>
  );
};

export default TapTempo;


