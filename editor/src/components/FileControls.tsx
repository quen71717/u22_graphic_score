import React from "react";
import { useScore } from "../context/ScoreContext";

const FileControls: React.FC = () => {
  const { saveMEI, saveMusicXML } = useScore();

  return (
    <div className="file-controls p-2 bg-white dark:bg-gray-800 rounded shadow-md">
      <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        ファイル操作
      </h3>
      <div className="flex flex-wrap gap-1">
        <button
          onClick={saveMEI}
          className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
        >
          MEI形式で保存
        </button>
        <button
          onClick={saveMusicXML}
          className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
        >
          MusicXML形式で保存
        </button>
      </div>
    </div>
  );
};

export default FileControls;
