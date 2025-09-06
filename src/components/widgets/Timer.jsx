import React, { useEffect, useRef, useState } from "react";

const Timer = ({ hour: hourProp, min: minProp, sec: secProp, onUpdateWidgetProps }) => {
  const [hour, setHour] = useState(hourProp ?? 0);
  const [min, setMin] = useState(minProp ?? 0);
  const [sec, setSec] = useState(secProp ?? 0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef(null);

  const formatTime = (time) => {
    const h = String(Math.floor(time / 3600)).padStart(2, "0");
    const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const startTimer = () => {
    const totalSeconds = hour * 3600 + min * 60 + sec;
    if (totalSeconds <= 0) return;
    setTimeLeft(totalSeconds);
    setIsFinished(false);
    setIsActive(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsActive(false);
          setIsFinished(true); // <- show text here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(0);
    setHour(hourProp ?? 0);
    setMin(minProp ?? 0);
    setSec(secProp ?? 0);
  };

  // persist settings when they change (only when not running)
  useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") {
      onUpdateWidgetProps({ hour, min, sec });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, min, sec]);

  return (
    <div className="max-w-sm bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col items-center gap-4 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
      {/* Inputs */}
      {!isActive && timeLeft === 0 && !isFinished && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value) || 0)}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-14 text-center"
          />
          :
          <input
            type="number"
            min={0}
            max={59}
            value={min}
            onChange={(e) => setMin(parseInt(e.target.value) || 0)}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-14 text-center"
          />
          :
          <input
            type="number"
            min={0}
            max={59}
            value={sec}
            onChange={(e) => setSec(parseInt(e.target.value) || 0)}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-14 text-center"
          />
        </div>
      )}

      {/* Display */}
      {timeLeft > 0 && (
        <div className="text-4xl font-mono font-bold dark:text-gray-100 text-gray-800">
          {formatTime(timeLeft)}
        </div>
      )}

      {/* Finished Text */}
      {isFinished && (
        <div className="text-xl font-semibold text-red-600">⏰ Time’s up!</div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isActive && timeLeft === 0 && !isFinished && (
          <button
            className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
            onClick={startTimer}
          >
            Start
          </button>
        )}
        {isActive && (
          <button
            className="px-5 py-2 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition"
            onClick={pauseTimer}
          >
            Pause
          </button>
        )}
        {!isActive && timeLeft > 0 && (
          <button
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            onClick={startTimer}
          >
            Resume
          </button>
        )}
        {(timeLeft > 0 || isActive || isFinished) && (
          <button
            className="px-5 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
            onClick={resetTimer}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;
