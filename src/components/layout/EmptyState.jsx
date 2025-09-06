import React from "react";
import FeatureRequestModal from "./FeatureRequestModal";

const EmptyState = ({ onAddFirstWidget }) => {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: "calc(100vh - 80px)",
      }}
    >
      {/* Soft radial accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-pink-400/10 to-indigo-400/20 blur-3xl" />

      {/* Floating notes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-8 top-10 text-4xl opacity-40 animate-float-slow">
          🎵
        </div>
        <div className="absolute left-1/3 top-1/4 text-5xl opacity-30 animate-float-slower">
          🎶
        </div>
        <div className="absolute right-10 top-12 text-4xl opacity-40 animate-float-slow">
          🎼
        </div>
        <div className="absolute right-1/4 bottom-10 text-5xl opacity-30 animate-float-slower">
          🎵
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-6xl mb-4">🎼</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 mb-3">
            Craft your perfect practice lab
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Mix and match tools like a metronome, timer, interval trainer, and
            more. Drag, resize, and save your layout.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl ring-1 ring-gray-200 dark:ring-gray-700 p-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur text-left">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="font-semibold mb-1">Stay on time</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Metronome and timer keep your practice structured.
              </div>
            </div>
            <div className="rounded-xl ring-1 ring-gray-200 dark:ring-gray-700 p-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur text-left">
              <div className="text-2xl mb-2">🎧</div>
              <div className="font-semibold mb-1">Train your ear</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Interval trainer and drone for intonation and recognition.
              </div>
            </div>
            <div className="rounded-xl ring-1 ring-gray-200 dark:ring-gray-700 p-4 bg-white/70 dark:bg-gray-900/40 backdrop-blur text-left">
              <div className="text-2xl mb-2">🎲</div>
              <div className="font-semibold mb-1">Explore creatively</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Random scales and notes to challenge your routine.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow"
              onClick={onAddFirstWidget}
            >
              Add your first widget
            </button>
            <button
              id="req-feature-btn"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow"
            >
              💡 Request a feature
            </button>
          </div>

          <div className="mt-10 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Built by{" "}
              <a
                href="https://github.com/wormcracker"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-gray-800 dark:hover:text-gray-200"
              >
                @wormcracker (Sushant)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
