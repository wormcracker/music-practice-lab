import React, { useEffect, useState } from "react";
import Header from "./Header";
import EmptyState from "./EmptyState";
import WidgetArea from "./WidgetArea";
import AddWidgetContent from "../widgets/AddWidgetContent";
import FeatureRequestModal from "./FeatureRequestModal";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";

const Layout = () => {
  const [widgets, setWidgets] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showFeature, setShowFeature] = useState(false);

  const updateWidget = (id, updatedWidget) => {
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) => (widget.id === id ? updatedWidget : widget)),
    );
  };

  const removeWidget = (id) => {
    setWidgets((prevWidgets) => prevWidgets.filter((w) => w.id !== id));
  };

  const bringWidgetToFront = (id) => {
    setWidgets((prevWidgets) => {
      const maxZ = prevWidgets.reduce(
        (max, w) => Math.max(max, w.zIndex || 0),
        0,
      );
      return prevWidgets.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w,
      );
    });
  };

  // load and persist widgets
  useEffect(() => {
    const stored = localStorage.getItem("mpl-widgets");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setWidgets(parsed);
      } catch {}
    }
    setHasLoaded(true);
  }, []);

  // open feature request modal on global event and handle button clicks
  useEffect(() => {
    const open = () => setShowFeature(true);
    window.addEventListener("mpl-feature-request", open);

    // Handle direct button clicks (for when EmptyState is shown)
    const handleButtonClick = (e) => {
      if (e.target.id === "req-feature-btn") {
        e.preventDefault();
        setShowFeature(true);
      }
    };
    document.addEventListener("click", handleButtonClick);

    return () => {
      window.removeEventListener("mpl-feature-request", open);
      document.removeEventListener("click", handleButtonClick);
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem("mpl-widgets", JSON.stringify(widgets));
  }, [widgets, hasLoaded]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    widgets,
    () => setShowPopup(true), // onAddWidget
    () => {
      // onToggleMetronome - find metronome widget and toggle it
      const metronome = widgets.find((w) => w.type === "Metronome");
      if (metronome) {
        // This would need to be implemented to actually toggle the metronome
        console.log("Toggle metronome via keyboard shortcut");
      }
    },
    () => {
      // onGenerateNote - find note generator and generate next note
      const noteGen = widgets.find((w) => w.type === "Note Generator");
      if (noteGen) {
        // This would need to be implemented to actually generate the next note
        console.log("Generate next note via keyboard shortcut");
      }
    },
    () => {
      // onGenerateNote - find note generator and generate next note
      const recorder = widgets.find((w) => w.type === "Recording");
      if (recorder) {
        // This would need to be implemented to actually generate the next note
        console.log("Toggle Recording");
      }
    },
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K to open Add Widget popup
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowPopup(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        onAddWidget={() => setShowPopup(true)}
        onImportWidgets={(data) => setWidgets(Array.isArray(data) ? data : [])}
      />
      {widgets.length === 0 ? (
        <EmptyState onAddFirstWidget={() => setShowPopup(true)} />
      ) : (
        <WidgetArea
          widgets={widgets}
          onUpdateWidget={updateWidget}
          onRemoveWidget={removeWidget}
          onFocusWidget={bringWidgetToFront}
        />
      )}
      {showPopup && (
        <AddWidgetContent
          onClose={() => setShowPopup(false)}
          setWidgets={setWidgets}
          widgets={widgets}
        />
      )}
      {showFeature && (
        <FeatureRequestModal
          isOpen={showFeature}
          onClose={() => setShowFeature(false)}
        />
      )}
    </div>
  );
};

export default Layout;
