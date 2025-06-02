import React, { useState } from "react";
import { useScore } from "../context/ScoreContext";

interface NoteDurationControlsProps {
  selectedNoteId: string | null;
}

// BeamControls コンポーネントを修正
const BeamControls: React.FC<{ selectedNoteId: string }> = ({
  selectedNoteId,
}) => {
  const { addBeam, removeBeam } = useScore();
  const [beamCount, setBeamCount] = useState<number>(2);

  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">連桁制御</h3>
      
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
}) => {
  const { changeNoteDuration } = useScore();

  // 有効な音符が選択されていない場合は何も表示しない
  if (!selectedNoteId) {
    return null;
  }

  // 音価の選択肢
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
    }
  };

  return (
    <div className="note-duration-controls p-2 bg-white dark:bg-gray-800 rounded shadow-md">
      <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        音価を選択
      </h3>
      <div className="flex flex-wrap gap-1">
        {durations.map((dur) => (
          <button
            key={dur.value}
            onClick={() => handleDurationChange(dur.value)}
            className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            {dur.label}
          </button>
        ))}
      </div>

      {/* ビームコントロールを追加 */}
      <BeamControls selectedNoteId={selectedNoteId} />
    </div>
  );
};

export default NoteDurationControls;
