import React, { useRef, useEffect } from "react";
import { useIntegratedScore } from "../context/IntegratedScoreContext";
import "../styles/score.css";

interface ScoreViewerProps {
  className?: string;
}

const ScoreViewer: React.FC<ScoreViewerProps> = ({ className = "" }) => {
  const { svgOutput, isVerovioReady } = useIntegratedScore();
  const containerRef = useRef<HTMLDivElement>(null);

  // SVG出力の更新
  useEffect(() => {
    if (!containerRef.current || !svgOutput) return;

    // Insert the SVG into the container
    containerRef.current.innerHTML = svgOutput;

    // Make the SVG responsive
    const svg = containerRef.current.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", "100%");
      svg.style.height = "auto";
      svg.style.display = "block";
    }
  }, [svgOutput]);

  if (!isVerovioReady) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-white dark:bg-gray-800 ${className}`}
      >
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Verovio 楽譜エンジンを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 overflow-auto p-4 ${className}`}>
      <div ref={containerRef} className="score-container mx-auto" />
    </div>
  );
};

export default ScoreViewer;
