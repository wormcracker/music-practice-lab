import React, { useEffect, useRef, useState } from "react";

const Stopwatch = ({ seconds: secondsProp, isActive: isActiveProp, onUpdateWidgetProps }) => {
  const [seconds, setSeconds] = useState(secondsProp ?? 0);
  const [isActive, setIsActive] = useState(isActiveProp ?? false);
  const intervalRef = useRef(null);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;
    const formattedMinute = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinute}:${formattedSeconds}`;
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  // persist settings
  useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") {
      onUpdateWidgetProps({ seconds, isActive });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, isActive]);

  return (
    <div className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col items-center gap-4 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
      <div className="text-4xl font-mono font-bold tracking-widest text-gray-800 dark:text-gray-100">
        {formatTime(seconds)}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        {seconds === 0 ? (
          <button
            className="px-5 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition"
            onClick={() => setIsActive(true)}
          >
            Start
          </button>
        ) : (
          <>
            <button
              className={`px-5 py-2 rounded-lg font-medium text-white transition ${
                isActive
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? "Pause" : "Resume"}
            </button>
            <button
              className="px-5 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
              onClick={() => {
                setIsActive(false);
                setSeconds(0);
              }}
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;
