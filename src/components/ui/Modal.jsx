import { X } from "lucide-react";
import React from "react";

const Modal = ({ onClose, isOpen, children, size = "md", zindex = "none" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/30 backdrop-blur-sm p-4">
      <div
        className={`rounded-xl relative p-6 w-full ${sizeClasses[size]} z-[${zindex}] bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
