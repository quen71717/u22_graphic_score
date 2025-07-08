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
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const { moveNoteByStep } = useIntegratedScore();

  const handleReset = useCallback(() => {
    setResetKey((prev) => prev + 1);
  }, []);

  // 楽譜クリック時: noteIdと座標をセットしツールチップ表示
  const handleNoteClick = (noteId: string, pos: { x: number; y: number }) => {
    setSelectedNoteId(noteId);
    setTooltipPos(pos);
    setTooltipVisible(true);
  };

  // 楽譜エリア外クリックでツールチップを閉じる
  const handleScoreAreaClick = (e: React.MouseEvent) => {
    // クリックがツールチップ内でなければ閉じる
    if (!(e.target as HTMLElement).closest(".note-duration-controls")) {
      setTooltipVisible(false);
      setSelectedNoteId(null);
    }
  };

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
        <div
          className="flex-1 panel-body relative"
          onClick={handleScoreAreaClick}
        >
          <ScoreViewer
            className="h-full"
            onNoteClick={handleNoteClick}
            onNoteMove={moveNoteByStep}
            selectedNoteId={selectedNoteId}
          />
          <NoteDurationControls
            selectedNoteId={selectedNoteId}
            position={tooltipPos}
            visible={tooltipVisible}
            onClose={() => setTooltipVisible(false)}
          />
        </div>
        <NotationControls onReset={handleReset} />
      </div>
    </div>
  );
};

export default IntegratedEditor;