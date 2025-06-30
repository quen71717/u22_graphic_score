import React, { useState, useCallback } from "react";
import DrawableCanvas from "./DrawableCanvas";
import ScoreViewer from "./ScoreViewer";
import NotationControls from "./NotationControls";

const IntegratedEditor: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);

  // リセット時に呼ばれる関数
  const handleReset = useCallback(() => {
    setResetKey((prev) => prev + 1);
  }, []);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
      {/* 左パネル: 図形譜キャンバス */}
      <div className="panel flex flex-col">
        <div className="panel-header">図形譜キャンバス</div>
        <div className="panel-body overflow-auto">
          <DrawableCanvas resetKey={resetKey} />
        </div>
      </div>

      {/* 右パネル: 楽譜表示 */}
      <div className="panel flex flex-col">
        <div className="panel-header">生成された楽譜</div>
        <div className="panel-body flex-1">
          <ScoreViewer className="h-full" />
        </div>
        <NotationControls onReset={handleReset} />
      </div>
    </div>
  );
};

export default IntegratedEditor;
