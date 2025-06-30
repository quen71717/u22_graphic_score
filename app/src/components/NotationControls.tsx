import React from "react";
import { useIntegratedScore } from "../context/IntegratedScoreContext";

interface NotationControlsProps {
  onReset: () => void;
}

const NotationControls: React.FC<NotationControlsProps> = ({ onReset }) => {
  const { zoomIn, zoomOut, resetDrawing } = useIntegratedScore();

  const handleReset = () => {
    resetDrawing(); // データリセット
    onReset();      // Canvasリセット
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button onClick={handleReset} className="btn btn-secondary">
            リセット
          </button>
        </div>

        <div className="flex space-x-2">
          <button onClick={zoomOut} className="btn btn-primary">
            縮小
          </button>
          <button onClick={zoomIn} className="btn btn-primary">
            拡大
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotationControls;
