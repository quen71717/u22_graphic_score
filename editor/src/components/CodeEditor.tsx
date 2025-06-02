import React, { useState, useEffect } from 'react';
import { useScore } from '../context/ScoreContext';

const CodeEditor: React.FC = () => {
  const { scoreData, setScoreData } = useScore();
  const [localContent, setLocalContent] = useState(scoreData);

  useEffect(() => {
    setLocalContent(scoreData);
  }, [scoreData]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };

  const handleApplyChanges = () => {
    setScoreData(localContent);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-sm font-medium">MEI Code Editor</h3>
        <button
          onClick={handleApplyChanges}
          className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors duration-200"
        >
          Apply Changes
        </button>
      </div>
      <textarea
        value={localContent}
        onChange={handleChange}
        className="flex-1 p-4 font-mono text-sm w-full h-full resize-none outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeEditor;