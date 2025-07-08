import React, { useState } from "react";
import { useIntegratedScore } from "../context/IntegratedScoreContext";

interface NoteDurationControlsProps {
  selectedNoteId: string | null;
  position: { x: number; y: number };
  visible: boolean;
  onClose?: () => void;
}

// SVGアイコン定義
const NoteIcons: Record<string, JSX.Element> = {
  "1": (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <ellipse
        cx="14"
        cy="14"
        rx="10"
        ry="7"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  ),
  "2": (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <ellipse
        cx="14"
        cy="18"
        rx="8"
        ry="5"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      <rect x="20" y="4" width="2" height="14" fill="black" />
    </svg>
  ),
  "4": (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <ellipse
        cx="14"
        cy="18"
        rx="8"
        ry="5"
        fill="black"
        stroke="black"
        strokeWidth="2"
      />
      <rect x="20" y="4" width="2" height="14" fill="black" />
    </svg>
  ),
  "8": (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <ellipse
        cx="14"
        cy="18"
        rx="8"
        ry="5"
        fill="black"
        stroke="black"
        strokeWidth="2"
      />
      <rect x="20" y="4" width="2" height="14" fill="black" />
      <path
        d="M22 4 Q26 8 22 12"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),
  "16": (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <ellipse
        cx="14"
        cy="18"
        rx="8"
        ry="5"
        fill="black"
        stroke="black"
        strokeWidth="2"
      />
      <rect x="20" y="4" width="2" height="14" fill="black" />
      <path
        d="M22 4 Q26 8 22 12"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M22 8 Q26 12 22 16"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),
  "32": (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <ellipse
        cx="14"
        cy="18"
        rx="8"
        ry="5"
        fill="black"
        stroke="black"
        strokeWidth="2"
      />
      <rect x="20" y="4" width="2" height="14" fill="black" />
      <path
        d="M22 4 Q26 8 22 12"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M22 8 Q26 12 22 16"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M22 12 Q26 16 22 20"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),
};

const BeamControls: React.FC<{ selectedNoteId: string }> = ({
  selectedNoteId,
}) => {
  const { addBeam, removeBeam } = useIntegratedScore();
  const [beamCount, setBeamCount] = useState<number>(2);

  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        連桁制御
      </h3>
      <div className="flex items-center mb-2">
        <label className="text-xs mr-2">連桁数:</label>
        <select
          value={beamCount}
          onChange={(e) => setBeamCount(Number(e.target.value))}
          className="text-xs p-1 border rounded"
        >
          <option value="2">2音符</option>
          <option value="3">3音符</option>
          <option value="4">4音符</option>
          <option value="5">5音符</option>
          <option value="6">6音符</option>
          <option value="8">8音符</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => addBeam(selectedNoteId, beamCount)}
          className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
        >
          {beamCount}音符連桁
        </button>
        <button
          onClick={() => removeBeam(selectedNoteId)}
          className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
        >
          連桁を解除
        </button>
      </div>
    </div>
  );
};

const NoteDurationControls: React.FC<NoteDurationControlsProps> = ({
  selectedNoteId,
  position,
  visible,
  onClose,
}) => {
  const { changeNoteDuration } = useIntegratedScore();

  if (!selectedNoteId || !visible) {
    return null;
  }

  const durations = [
    { value: "1", label: "全音符" },
    { value: "2", label: "二分音符" },
    { value: "4", label: "四分音符" },
    { value: "8", label: "八分音符" },
    { value: "16", label: "十六分音符" },
    { value: "32", label: "三十二分音符" },
  ];

  const handleDurationChange = (duration: string) => {
    if (selectedNoteId) {
      changeNoteDuration(selectedNoteId, duration);
      if (onClose) onClose();
    }
  };

  return (
    <div
      className="note-duration-controls p-2 bg-white dark:bg-gray-800 rounded shadow-md border z-50"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y + 56, // さらに下にオフセット
        minWidth: 180,
      }}
    >
      <div className="flex flex-wrap gap-1 justify-center">
        {durations.map((dur) => (
          <button
            key={dur.value}
            onClick={() => handleDurationChange(dur.value)}
            className="w-10 h-10 flex items-center justify-center bg-blue-100 hover:bg-blue-300 rounded transition-colors border border-blue-400"
            title={dur.label}
          >
            {NoteIcons[dur.value]}
          </button>
        ))}
      </div>
      <BeamControls selectedNoteId={selectedNoteId} />
      {onClose && (
        <button
          className="absolute top-1 right-1 text-xs text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default NoteDurationControls;
