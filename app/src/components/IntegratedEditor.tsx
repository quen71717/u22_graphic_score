import React, { useState, useCallback } from "react";
import DrawableCanvas from "./DrawableCanvas";
import ScoreViewer from "./ScoreViewer";
import NotationControls from "./NotationControls";
import MidiControls from "./MidiControls";
import NoteDurationControls from "./NoteDurationControls";
import { useIntegratedScore } from "../context/IntegratedScoreContext";

const IntegratedEditor: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { moveNoteByStep } = useIntegratedScore();

  const handleReset = useCallback(() => {
    setResetKey((prev) => prev + 1);
  }, []);

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 p-4 overflow-hidden md:grid-cols-2">
      {/* 左パネル: 図形譜キャンバス */}
      <div className="flex flex-col panel">
        <div className="panel-header">図形譜キャンバス</div>
        <div className="overflow-auto panel-body">
          <DrawableCanvas resetKey={resetKey} />
        </div>
      </div>

      {/* 右パネル: 楽譜表示 */}
      <div className="flex flex-col panel">
        <div className="flex items-center justify-between panel-header">
          <div>生成された楽譜</div>
          <MidiControls />
        </div>
        <div className="flex-1 panel-body">
          <ScoreViewer
            className="h-full"
            onNoteClick={setSelectedNoteId}
            onNoteMove={moveNoteByStep}
            selectedNoteId={selectedNoteId}
          />
          {selectedNoteId && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <NoteDurationControls selectedNoteId={selectedNoteId} />
            </div>
          )}
        </div>
        <NotationControls onReset={handleReset} />
      </div>
    </div>
  );
};

export default IntegratedEditor;