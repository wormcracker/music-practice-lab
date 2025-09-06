import React, { useState } from "react";

const COMBINED_NOTES = [
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

const SEPARATE_NOTES = [
  "C",
  "C♯",
  "D♭",
  "D",
  "D♯",
  "E♭",
  "E",
  "F",
  "F♯",
  "G♭",
  "G",
  "G♯",
  "A♭",
  "A",
  "A♯",
  "B♭",
  "B",
];

const NoteGenerator = ({
  useCombined: useCombinedProp,
  onUpdateWidgetProps,
}) => {
  const [useCombined, setUseCombined] = useState(useCombinedProp ?? true);
  const [availableNotes, setAvailableNotes] = useState(
    useCombined ? [...COMBINED_NOTES] : [...SEPARATE_NOTES],
  );
  const [currentNote, setCurrentNote] = useState(null);
  const [cycle, setCycle] = useState(0);

  // Toggle combined/separate
  const handleToggleNotes = () => {
    const newNotes = useCombined ? [...SEPARATE_NOTES] : [...COMBINED_NOTES];
    setUseCombined(!useCombined);
    setAvailableNotes([...newNotes]);
    setCurrentNote(null);
    setCycle(0);
  };

  const generateNote = () => {
    if (availableNotes.length === 0) {
      // Start new cycle
      const newNotes = useCombined ? [...COMBINED_NOTES] : [...SEPARATE_NOTES];
      setAvailableNotes(newNotes);
      setCycle((prev) => prev + 1);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    const note = availableNotes[randomIndex];

    const newAvailableNotes = availableNotes.filter((n) => n !== note);
    setAvailableNotes(newAvailableNotes);
    setCurrentNote(note);
  };

  // keyboard shortcut: 'n' for next note
  React.useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable = document.activeElement?.isContentEditable;
      if (tag === "input" || tag === "textarea" || isEditable) {
        return;
      }
      if (e.key && e.key.toLowerCase() === "n") {
        e.preventDefault();
        generateNote();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [availableNotes, useCombined]);

  // persist mode
  React.useEffect(() => {
    if (typeof onUpdateWidgetProps === "function") {
      onUpdateWidgetProps({ useCombined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCombined]);

  return (
    <div className="max-w-sm p-6 rounded-xl text-center shadow-lg font-sans bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Random Note Generator</h2>

      <div className="text-4xl font-bold mb-2">{currentNote || "-"}</div>
      <div className="text-sm opacity-70 mb-4">Cycle Completed: {cycle}</div>

      <div className="flex justify-center gap-4 mb-4">
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
          onClick={generateNote}
        >
          Next Note{" "}
          <span className="hidden lg:inline text-xs bg-blue-500 px-2 py-1 rounded">
            n
          </span>
        </button>

        <button
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
          onClick={handleToggleNotes}
        >
          {useCombined ? "Separate ♯/♭" : "Combine ♯/♭"}
        </button>
      </div>

      <div className="text-sm opacity-70 mt-2">
        Notes remaining in this round: {availableNotes.length}
      </div>
    </div>
  );
};

export default NoteGenerator;
