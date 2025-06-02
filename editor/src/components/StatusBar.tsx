import React from 'react';
import { useScore } from '../context/ScoreContext';

const StatusBar: React.FC = () => {
  const { scale } = useScore();

  return (
    <div className="h-8 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
      <div>Zoom: {scale}%</div>
      <div>Verovio Music Editor v0.1.0</div>
      <div>Ready</div>
    </div>
  );
};

export default StatusBar;