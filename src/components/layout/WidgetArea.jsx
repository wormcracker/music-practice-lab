// WidgetArea.jsx
import React, { useEffect, useRef, useState } from "react";
import Stopwatch from "../widgets/Stopwatch";
import Timer from "../widgets/Timer";
import Metronome from "../widgets/Metronome";
import NoteGenerator from "../widgets/NoteGenerator";
import RandomScaleGenerator from "../widgets/RandomScaleGenerator";
import TapTempo from "../widgets/TapTempo";
import Drone from "../widgets/Drone";
import ChordProgression from "../widgets/ChordProgression";
import IntervalTrainer from "../widgets/IntervalTrainer";
import DraggableWidget from "./DraggableWidget";
import Note from "../widgets/Note";
import Tuner from "../widgets/Tuner";
import Recording from "../widgets/Recording";
import CircleOfFifths from "../widgets/CircleOfFifths";
import Looper from "../widgets/Looper";

const WIDGET_COMPONENTS = {
  Timer: Timer,
  Stopwatch: Stopwatch,
  Metronome: Metronome,
  "Note Generator": NoteGenerator,
  "Random Scale Generator": RandomScaleGenerator,
  "Tap Tempo": TapTempo,
  Drone: Drone,
  "Chord Progression": ChordProgression,
  "Interval Trainer": IntervalTrainer,
  Note: Note,
  Tuner: Tuner,
  Recording: Recording,
  "Circle of Fifths": CircleOfFifths,
  Looper: Looper,
};

const WidgetArea = ({
  widgets,
  onUpdateWidget,
  onRemoveWidget,
  onFocusWidget,
}) => {
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState(null);

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current)
        setContainerRect(containerRef.current.getBoundingClientRect());
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: "calc(100dvh - 80px)" }}
    >
      {widgets.map((widget) => {
        const WidgetComponent = WIDGET_COMPONENTS[widget.type];
        if (!WidgetComponent) return null;
        return (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            onUpdateWidget={onUpdateWidget}
            onRemoveWidget={onRemoveWidget}
            onFocusWidget={onFocusWidget}
            containerRect={containerRect}
          >
            <WidgetComponent {...(widget.props || {})} />
          </DraggableWidget>
        );
      })}
    </div>
  );
};

export default WidgetArea;
