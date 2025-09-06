import React, { useState, useEffect } from "react";
import { Music, Info } from "lucide-react";

const CircleOfFifths = ({ 
  selectedKey = "C", 
  showMode = "major",
  onUpdateWidgetProps 
}) => {
  const [localSelectedKey, setLocalSelectedKey] = useState(selectedKey);
  const [localShowMode, setLocalShowMode] = useState(showMode);
  const [showInfo, setShowInfo] = useState(false);

  // Initialize from props
  useEffect(() => {
    setLocalSelectedKey(selectedKey);
  }, [selectedKey]);

  useEffect(() => {
    setLocalShowMode(showMode);
  }, [showMode]);

  const majorKeys = [
    { key: "C", sharps: 0, flats: 0 },
    { key: "G", sharps: 1, flats: 0 },
    { key: "D", sharps: 2, flats: 0 },
    { key: "A", sharps: 3, flats: 0 },
    { key: "E", sharps: 4, flats: 0 },
    { key: "B", sharps: 5, flats: 0 },
    { key: "F#", sharps: 6, flats: 0 },
    { key: "C#", sharps: 7, flats: 0 },
    { key: "F", sharps: 0, flats: 1 },
    { key: "Bb", sharps: 0, flats: 2 },
    { key: "Eb", sharps: 0, flats: 3 },
    { key: "Ab", sharps: 0, flats: 4 },
    { key: "Db", sharps: 0, flats: 5 },
    { key: "Gb", sharps: 0, flats: 6 },
    { key: "Cb", sharps: 0, flats: 7 }
  ];

  const minorKeys = [
    { key: "Am", sharps: 0, flats: 0 },
    { key: "Em", sharps: 1, flats: 0 },
    { key: "Bm", sharps: 2, flats: 0 },
    { key: "F#m", sharps: 3, flats: 0 },
    { key: "C#m", sharps: 4, flats: 0 },
    { key: "G#m", sharps: 5, flats: 0 },
    { key: "D#m", sharps: 6, flats: 0 },
    { key: "A#m", sharps: 7, flats: 0 },
    { key: "Dm", sharps: 0, flats: 1 },
    { key: "Gm", sharps: 0, flats: 2 },
    { key: "Cm", sharps: 0, flats: 3 },
    { key: "Fm", sharps: 0, flats: 4 },
    { key: "Bbm", sharps: 0, flats: 5 },
    { key: "Ebm", sharps: 0, flats: 6 },
    { key: "Abm", sharps: 0, flats: 7 }
  ];

  const getKeyInfo = (keyName) => {
    const keys = localShowMode === "major" ? majorKeys : minorKeys;
    return keys.find(k => k.key === keyName) || keys[0];
  };

  const getRelativeKey = (keyName) => {
    if (localShowMode === "major") {
      const majorIndex = majorKeys.findIndex(k => k.key === keyName);
      return minorKeys[majorIndex]?.key || "Am";
    } else {
      const minorIndex = minorKeys.findIndex(k => k.key === keyName);
      return majorKeys[minorIndex]?.key || "C";
    }
  };

  const getChordProgression = (keyName) => {
    const progressions = {
      "C": ["C", "Am", "F", "G"],
      "G": ["G", "Em", "C", "D"],
      "D": ["D", "Bm", "G", "A"],
      "A": ["A", "F#m", "D", "E"],
      "E": ["E", "C#m", "A", "B"],
      "B": ["B", "G#m", "E", "F#"],
      "F#": ["F#", "D#m", "B", "C#"],
      "F": ["F", "Dm", "Bb", "C"],
      "Bb": ["Bb", "Gm", "Eb", "F"],
      "Eb": ["Eb", "Cm", "Ab", "Bb"],
      "Ab": ["Ab", "Fm", "Db", "Eb"],
      "Db": ["Db", "Bbm", "Gb", "Ab"],
      "Am": ["Am", "F", "C", "G"],
      "Em": ["Em", "C", "G", "D"],
      "Bm": ["Bm", "G", "D", "A"],
      "F#m": ["F#m", "D", "A", "E"],
      "C#m": ["C#m", "A", "E", "B"],
      "G#m": ["G#m", "E", "B", "F#"],
      "D#m": ["D#m", "B", "F#", "C#"],
      "Dm": ["Dm", "Bb", "F", "C"],
      "Gm": ["Gm", "Eb", "Bb", "F"],
      "Cm": ["Cm", "Ab", "Eb", "Bb"],
      "Fm": ["Fm", "Db", "Ab", "Eb"],
      "Bbm": ["Bbm", "Gb", "Db", "Ab"],
      "Ebm": ["Ebm", "Cb", "Gb", "Db"]
    };
    return progressions[keyName] || ["I", "vi", "IV", "V"];
  };

  const handleKeySelect = (keyName) => {
    setLocalSelectedKey(keyName);
    if (onUpdateWidgetProps) {
      onUpdateWidgetProps({ selectedKey: keyName, showMode: localShowMode });
    }
  };

  const handleModeChange = (mode) => {
    setLocalShowMode(mode);
    if (onUpdateWidgetProps) {
      onUpdateWidgetProps({ selectedKey: localSelectedKey, showMode: mode });
    }
  };

  const currentKeyInfo = getKeyInfo(localSelectedKey);
  const relativeKey = getRelativeKey(localSelectedKey);
  const chordProgression = getChordProgression(localSelectedKey);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Circle of Fifths</h3>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange("major")}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            localShowMode === "major"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Major
        </button>
        <button
          onClick={() => handleModeChange("minor")}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            localShowMode === "minor"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Minor
        </button>
      </div>

      {/* Circle Visualization */}
      <div className="relative w-64 h-64 mx-auto overflow-visible">
        <div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-600">
          {(localShowMode === "major" ? majorKeys : minorKeys).map((keyInfo, index) => {
            const angle = (index * 24) - 90; // Start from top
            const radius = 90; // Reduced radius to ensure buttons are within bounds
            const x = 128 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 128 + radius * Math.sin((angle * Math.PI) / 180);
            
            return (
              <button
                key={keyInfo.key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleKeySelect(keyInfo.key);
                }}
                className={`absolute w-10 h-10 rounded-full text-xs font-bold transition-all transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                  localSelectedKey === keyInfo.key
                    ? "bg-blue-600 text-white scale-110 shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
                style={{ 
                  left: x, 
                  top: y,
                  pointerEvents: 'auto'
                }}
                title={`Select ${keyInfo.key}`}
              >
                {keyInfo.key}
              </button>
            );
          })}
        </div>
        
        {/* Center Info */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {localSelectedKey}
            </div>
            <div className="text-xs text-gray-500">
              {currentKeyInfo.sharps > 0 && `${currentKeyInfo.sharps} ♯`}
              {currentKeyInfo.flats > 0 && `${currentKeyInfo.flats} ♭`}
              {currentKeyInfo.sharps === 0 && currentKeyInfo.flats === 0 && "Natural"}
            </div>
          </div>
        </div>
      </div>

      {/* Key Information */}
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm font-medium mb-2">Key Information</div>
          <div className="text-sm space-y-1">
            <div><strong>Selected:</strong> {localSelectedKey}</div>
            <div><strong>Relative {localShowMode === "major" ? "Minor" : "Major"}:</strong> {relativeKey}</div>
            <div><strong>Accidentals:</strong> {
              currentKeyInfo.sharps > 0 ? `${currentKeyInfo.sharps} sharps` :
              currentKeyInfo.flats > 0 ? `${currentKeyInfo.flats} flats` :
              "None"
            }</div>
          </div>
        </div>

        {/* Common Chord Progression */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm font-medium mb-2">Common Progression (I-vi-IV-V)</div>
          <div className="flex gap-2 flex-wrap">
            {chordProgression.map((chord, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium"
              >
                {chord}
              </span>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm">
              <div className="font-medium mb-2">How to use:</div>
              <ul className="space-y-1 text-xs">
                <li>• Click any key to select it</li>
                <li>• Toggle between major and minor modes</li>
                <li>• View relative keys and chord progressions</li>
                <li>• Keys are arranged in perfect fifths</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircleOfFifths;
