import React, { useEffect, useState } from "react";

const DraggableWidget = ({
  widget,
  children,
  onUpdateWidget,
  onRemoveWidget,
  onFocusWidget,
  containerRect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ← Add useEffect for mouse movement
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      let newX = clientX - dragStart.x;
      let newY = clientY - dragStart.y;

      if (containerRect) {
        const maxX = containerRect.width - widget.size.w;
        const maxY = containerRect.height - widget.size.h;
        newX = Math.min(Math.max(0, newX), Math.max(0, maxX));
        newY = Math.min(Math.max(0, newY), Math.max(0, maxY));
      }

      onUpdateWidget(widget.id, {
        ...widget,
        position: { x: newX, y: newY },
      });
    };

    const handlePointerUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      // also support legacy mouse/touch
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchmove", handlePointerMove, {
        passive: false,
      });
      window.addEventListener("touchend", handlePointerUp);
      window.addEventListener("touchcancel", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      window.removeEventListener("touchcancel", handlePointerUp);
    };
  }, [isDragging, dragStart, widget, onUpdateWidget, containerRect]);

  const handlePointerDown = (e) => {
    if (onFocusWidget) {
      onFocusWidget(widget.id);
    }
    // prevent scrolling on touch when dragging
    if (e.cancelable) e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - widget.position.x,
      y: e.clientY - widget.position.y,
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.w,
        height: widget.size.h,
        zIndex: widget.zIndex || 1,
      }}
    >
      <div className="rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden bg-white dark:bg-gray-800">
        <div
          className="drag-handle cursor-move select-none px-3 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700"
          onPointerDown={handlePointerDown}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          style={{ touchAction: "none" }}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
            <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
              {widget.type}
            </span>
          </div>
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => onRemoveWidget && onRemoveWidget(widget.id)}
            aria-label="Close widget"
          >
            ✕
          </button>
        </div>

        <div className="p-3">
          {React.isValidElement(children)
            ? React.cloneElement(children, {
                widgetId: widget.id,
                onUpdateWidgetProps: (newProps) =>
                  onUpdateWidget(widget.id, {
                    ...widget,
                    props: { ...(widget.props || {}), ...newProps },
                  }),
              })
            : children}
        </div>
      </div>
    </div>
  );
};

export default DraggableWidget;
