import { useEffect } from "react";

const useKeyboardShortcuts = (
  widgets,
  onAddWidget,
  onToggleMetronome,
  onGenerateNote,
) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      // Global shortcuts
      switch (e.key) {
        case "m":
        case "M":
          // Toggle metronome if it exists
          const metronome = widgets.find((w) => w.type === "Metronome");
          if (metronome && onToggleMetronome) {
            e.preventDefault();
            onToggleMetronome();
          }
          break;

        case "n":
        case "N":
          // Generate next note if Note Generator exists
          const noteGen = widgets.find((w) => w.type === "Note Generator");
          if (noteGen && onGenerateNote) {
            e.preventDefault();
            onGenerateNote();
          }
          break;

        case "t":
        case "T":
          // Start/stop timer if Timer exists
          const timer = widgets.find((w) => w.type === "Timer");
          if (timer) {
            e.preventDefault();
            // This would need to be implemented in the Timer component
            console.log("Timer shortcut - implement in Timer component");
          }
          break;

        case "s":
        case "S":
          // Start/stop stopwatch if Stopwatch exists
          const stopwatch = widgets.find((w) => w.type === "Stopwatch");
          if (stopwatch) {
            e.preventDefault();
            // This would need to be implemented in the Stopwatch component
            console.log(
              "Stopwatch shortcut - implement in Stopwatch component",
            );
          }
          break;

        case "Escape":
          // Close any open modals or stop all audio
          e.preventDefault();
          // This could close modals or stop all widgets
          break;

        case " ":
          // Space bar - pause/play metronome or start/stop practice log
          e.preventDefault();
          const metronomeWidget = widgets.find((w) => w.type === "Metronome");
          const practiceLog = widgets.find((w) => w.type === "Practice Log");

          if (metronomeWidget && onToggleMetronome) {
            onToggleMetronome();
          } else if (practiceLog) {
            // This would need to be implemented in the Practice Log component
            console.log(
              "Practice Log shortcut - implement in Practice Log component",
            );
          }
          break;

        case "+":
        case "=":
          // Increase BPM if metronome exists
          const metronomeForBpm = widgets.find((w) => w.type === "Metronome");
          if (metronomeForBpm) {
            e.preventDefault();
            // This would need to be implemented in the Metronome component
            console.log(
              "Increase BPM shortcut - implement in Metronome component",
            );
          }
          break;

        case "-":
          // Decrease BPM if metronome exists
          const metronomeForBpmDec = widgets.find(
            (w) => w.type === "Metronome",
          );
          if (metronomeForBpmDec) {
            e.preventDefault();
            // This would need to be implemented in the Metronome component
            console.log(
              "Decrease BPM shortcut - implement in Metronome component",
            );
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [widgets, onAddWidget, onToggleMetronome, onGenerateNote]);
};

export default useKeyboardShortcuts;
