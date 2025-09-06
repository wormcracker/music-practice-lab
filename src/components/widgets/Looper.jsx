import React, { useRef, useState, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Layers } from "lucide-react";

const Looper = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopUrl, setLoopUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [loopDuration, setLoopDuration] = useState(0);
  const [isOverdubbing, setIsOverdubbing] = useState(false);

  const audioRef = useRef(null);
  const overdubRef = useRef(null);
  const streamRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setLoopUrl(url);
      setAudioChunks([]);
      // Get duration
      const tempAudio = document.createElement("audio");
      tempAudio.src = url;
      tempAudio.onloadedmetadata = () => {
        setLoopDuration(tempAudio.duration);
        tempAudio.remove();
      };
    };
    setMediaRecorder(recorder);
    setAudioChunks(chunks);
    recorder.start();
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  };

  // Play loop
  const startLoop = () => {
    if (audioRef.current && loopUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.loop = true;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Stop loop
  const stopLoop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Clear loop
  const clearLoop = () => {
    stopLoop();
    if (loopUrl) URL.revokeObjectURL(loopUrl);
    setLoopUrl(null);
    setLoopDuration(0);
    setIsOverdubbing(false);
  };

  // Overdub (record new layer on top of loop)
  const startOverdub = async () => {
    if (!loopUrl) return;
    setIsOverdubbing(true);
    // Play the loop in sync
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.loop = true;
      audioRef.current.play();
    }
    // Record new audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    overdubRef.current = stream;
    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      // Mix the overdub with the original loop (simple overlay)
      const overdubBlob = new Blob(chunks, { type: "audio/webm" });
      // For a true mix, you'd need to decode both, mix PCM, and re-encode (advanced).
      // Here, we just replace the loop with the overdub for demo.
      const url = URL.createObjectURL(overdubBlob);
      if (loopUrl) URL.revokeObjectURL(loopUrl);
      setLoopUrl(url);
      setIsOverdubbing(false);
      setLoopDuration(audioRef.current.duration);
    };
    recorder.start();
    setTimeout(() => {
      recorder.stop();
      if (overdubRef.current) {
        overdubRef.current.getTracks().forEach((t) => t.stop());
        overdubRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, loopDuration * 1000);
  };

  // Stop overdub
  const stopOverdub = () => {
    setIsOverdubbing(false);
    if (overdubRef.current) {
      overdubRef.current.getTracks().forEach((t) => t.stop());
      overdubRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (loopUrl) URL.revokeObjectURL(loopUrl);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (overdubRef.current)
        overdubRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [loopUrl]);

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h3 className="text-lg font-semibold">Looper</h3>
      <div className="flex gap-2">
        {!isRecording && !loopUrl && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            <Mic className="w-4 h-4" />
            Record Loop
          </button>
        )}
        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        )}
        {loopUrl && !isRecording && (
          <>
            {!isPlaying ? (
              <button
                onClick={startLoop}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                <Play className="w-4 h-4" />
                Play Loop
              </button>
            ) : (
              <button
                onClick={stopLoop}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                <Pause className="w-4 h-4" />
                Stop
              </button>
            )}
            {!isOverdubbing ? (
              <button
                onClick={startOverdub}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                disabled={isPlaying}
              >
                <Layers className="w-4 h-4" />
                Overdub
              </button>
            ) : (
              <button
                onClick={stopOverdub}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium"
              >
                <Square className="w-4 h-4" />
                Stop Overdub
              </button>
            )}
            <button
              onClick={clearLoop}
              className="flex items-center gap-2 px-4 py-2 bg-red-200 hover:bg-red-300 text-red-800 rounded-lg font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </>
        )}
      </div>
      {loopUrl && (
        <div className="mt-2">
          <audio
            ref={audioRef}
            src={loopUrl}
            controls
            loop
            style={{ width: "100%" }}
          />
          <div className="text-xs text-gray-500 mt-1">
            Loop duration: {loopDuration ? loopDuration.toFixed(2) + "s" : "—"}
          </div>
        </div>
      )}
      {isOverdubbing && (
        <div className="text-yellow-700 font-semibold mt-2">
          Overdubbing... (recording new layer)
        </div>
      )}
    </div>
  );
};

export default Looper;
