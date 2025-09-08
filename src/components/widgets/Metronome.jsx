import React, { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

const B4_FREQ = 493.88;
const C5_FREQ = 523.25;

const SUBDIVISIONS = [
  { label: "Quarter notes", value: 1 },
  { label: "Eighth notes", value: 2 },
  { label: "Triplets", value: 3 },
  { label: "Sixteenth notes", value: 4 },
  { label: "Sextuplets ", value: 6 },
];

const Metronome = ({
  widgetId,
  onUpdateWidgetProps,
  bpm: bpmProp,
  vol: volProp,
  beatsPerMeasure: bpmMeasureProp,
  accentFirstBeat: accentProp,
}) => {
  const [bpm, setBpm] = useState(bpmProp ?? 120);
  const [vol, setVol] = useState(volProp ?? 50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(bpmMeasureProp ?? 4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentSubdivision, setCurrentSubdivision] = useState(0);
  const [accentFirstBeat, setAccentFirstBeat] = useState(accentProp ?? true);
  const [subdivision, setSubdivision] = useState(1); // 1 = quarter notes
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const beatStateRef = useRef({ beat: 0, sub: 0 });

  // Play click using Web Audio API
  const playClick = async (isAccent = false, isSubdivision = false) => {
    let ctx = audioCtxRef.current;
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
    }
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    // Subdivision clicks are softer and lower
    if (isSubdivision) {
      osc.frequency.value = 370; // F#4
      gain.gain.value = 0.12;
    } else {
      osc.frequency.value = isAccent ? C5_FREQ : B4_FREQ;
      const baseVolume = vol / 100;
      gain.gain.value = isAccent ? baseVolume : 0.8 * baseVolume;
    }
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
    osc.stop(ctx.currentTime + 0.08);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  };

  const calculateInterval = (bpm, subdivision) => 60000 / (bpm * subdivision);

  const startInterval = () => {
    intervalRef.current = setInterval(
      () => {
        let { beat, sub } = beatStateRef.current;
        sub++;
        if (sub >= subdivision) {
          sub = 0;
          beat = (beat + 1) % beatsPerMeasure;
        }
        if (sub === 0) {
          playClick(accentFirstBeat && beat === 0, false);
        } else {
          playClick(false, true);
        }
        beatStateRef.current = { beat, sub };
        setCurrentBeat(beat);
        setCurrentSubdivision(sub);
      },
      calculateInterval(bpm, subdivision),
    );
  };

  const handleStart = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    beatStateRef.current = { beat: 0, sub: 0 };
    setCurrentBeat(0);
    setCurrentSubdivision(0);
    await playClick(!!accentFirstBeat, false);
    startInterval();
  };

  const handleStop = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    beatStateRef.current = { beat: 0, sub: 0 };
    setCurrentBeat(0);
    setCurrentSubdivision(0);
  };

  const handleChangeBpm = (value) => {
    const newBpm = Math.min(240, Math.max(40, Number(value)));
    setBpm(newBpm);

    if (isPlaying) {
      clearInterval(intervalRef.current);
      beatStateRef.current = { beat: 0, sub: 0 };
      setCurrentBeat(0);
      setCurrentSubdivision(0);
      startInterval();
    }
  };

  const handleChangeVolume = (value) => {
    setVol(value);

    if (isPlaying) {
      clearInterval(intervalRef.current);
      beatStateRef.current = { beat: 0, sub: 0 };
      setCurrentBeat(0);
      setCurrentSubdivision(0);
      startInterval();
    }
  };

  // When subdivision, beatsPerMeasure, or accent changes, reset everything and restart if playing
  useEffect(() => {
    if (!isPlaying) return;
    clearInterval(intervalRef.current);
    beatStateRef.current = { beat: 0, sub: 0 };
    setCurrentBeat(0);
    setCurrentSubdivision(0);
    startInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdivision, beatsPerMeasure, accentFirstBeat]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // persist settings when they change
  useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") {
      onUpdateWidgetProps({
        bpm,
        vol,
        beatsPerMeasure,
        accentFirstBeat,
        subdivision,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, vol, beatsPerMeasure, accentFirstBeat, subdivision]);

  useEffect(() => {
    const onKey = (e) => {
      // Ignore if focus is in an input, textarea, or contenteditable
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable = document.activeElement?.isContentEditable;
      if (tag === "input" || tag === "textarea" || isEditable) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        isPlaying ? handleStop() : handleStart();
      } else if (e.key === "=") {
        handleChangeBpm(bpm + 1);
      } else if (e.key === "-") {
        handleChangeBpm(bpm - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, isPlaying]);

  return (
    <div className="max-w-sm p-6 rounded-xl text-center shadow-lg font-sans bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Metronome</h2>

      {/* BPM Display */}
      <div className="flex flex-col items-center mb-4">
        <span className="text-4xl font-bold">{bpm}</span>
        <span className="text-sm opacity-70">BPM</span>
      </div>

      {/* Visual beat indicator with subdivisions */}
      <div className="flex flex-col items-center gap-1 mb-4">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
            const isActive = idx === currentBeat;
            const isAccent = accentFirstBeat && idx === 0;
            return (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  isActive
                    ? isAccent
                      ? "bg-red-500 scale-125"
                      : "bg-sky-500 scale-110"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            );
          })}
        </div>
        {/* Subdivision dots */}
        <div className="flex items-center justify-center gap-1 mt-1">
          {Array.from({ length: subdivision }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSubdivision
                  ? "bg-green-500 scale-110"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* BPM Controls */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        <button
          className="p-2 rounded-full bg-red-400 cursor-pointer hover:bg-red-500 transition"
          onClick={() => handleChangeBpm(bpm - 5)}
        >
          <Minus />
        </button>

        <button
          className="p-2 rounded-full bg-blue-400 cursor-pointer hover:bg-blue-500 transition"
          onClick={() => handleChangeBpm(bpm + 5)}
        >
          <Plus />
        </button>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-left">
        <div>
          <label className="block text-sm mb-1">Beats per measure</label>
          <select
            value={beatsPerMeasure}
            onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}/4
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={accentFirstBeat}
              onChange={(e) => setAccentFirstBeat(e.target.checked)}
            />
            Accent first beat
          </label>
        </div>
      </div>

      {/* Subdivision Selector */}
      <div className="mb-6">
        <label className="block text-sm mb-1">Subdivision</label>
        <select
          value={subdivision}
          onChange={(e) => setSubdivision(Number(e.target.value))}
          className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
        >
          {SUBDIVISIONS.map((sub) => (
            <option key={sub.value} value={sub.value}>
              {sub.label}
            </option>
          ))}
        </select>
      </div>

      {/* BPM Slider */}
      <div className="mb-6">
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          className="w-full h-2 rounded-lg bg-gray-200 dark:bg-gray-700 appearance-none cursor-pointer accent-sky-400"
          onChange={(e) => handleChangeBpm(e.target.value)}
        />
      </div>

      {/* BPM Slider */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max="100"
          value={vol}
          className="absolute w-[100px] right-0 top-[200px] h-2 rounded-lg bg-gray-200 dark:bg-gray-700 rotate-270 appearance-none cursor-pointer accent-sky-400"
          title="Volume"
          onChange={(e) => handleChangeVolume(e.target.value)}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-between ">
        {!isPlaying ? (
          <button
            className="text-white flex-1 mx-2 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 font-semibold transition cursor-pointer"
            onClick={handleStart}
          >
            ▶ Start{" "}
            <span className="hidden lg:inline text-xs bg-sky-400 px-2 py-1 rounded">
              space
            </span>
          </button>
        ) : (
          <button
            className="text-white flex-1 mx-2 py-3 rounded-lg bg-red-500 hover:bg-red-600 font-semibold transition cursor-pointer"
            onClick={handleStop}
          >
            ■ Stop{" "}
            <span className="hidden lg:inline text-xs bg-red-400 px-2 py-1 rounded">
              space
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Metronome;
