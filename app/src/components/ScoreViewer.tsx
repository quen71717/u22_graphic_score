import React, { useRef, useEffect } from "react";
import { useIntegratedScore } from "../context/IntegratedScoreContext";
import "../styles/score.css";

interface ScoreViewerProps {
  className?: string;
  onNoteClick?: (noteId: string, position: { x: number; y: number }) => void;
  onNoteMove?: (noteId: string, steps: number) => void;
  selectedNoteId?: string | null;
}

const ScoreViewer: React.FC<ScoreViewerProps> = ({
  className = "",
  onNoteClick,
  onNoteMove,
  selectedNoteId,
}) => {
  const { svgOutput, isVerovioReady } = useIntegratedScore();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ noteId: string | null; startY: number }>({
    noteId: null,
    startY: 0,
  });

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

    // 音符要素にイベント付与
    const notes = containerRef.current.querySelectorAll(".note");
    notes.forEach((note) => {
      note.classList.add("cursor-pointer", "hover:opacity-80");
      note.addEventListener("click", (e) => {
        e.stopPropagation();
        if (onNoteClick) {
          // SVG座標取得
          const svgElem = svg as SVGSVGElement;
          let x = 0,
            y = 0;
          if (svgElem && typeof note.getBoundingClientRect === "function") {
            const noteRect = note.getBoundingClientRect();
            const svgRect = svgElem.getBoundingClientRect();
            x = noteRect.left - svgRect.left + noteRect.width / 2;
            y = noteRect.bottom - svgRect.top; // 下端に表示
          }
          onNoteClick(note.id, { x, y });
        }
      });
      note.addEventListener("mousedown", (event) => {
        const e = event as MouseEvent;
        dragState.current = { noteId: note.id, startY: e.clientY };
        if (onNoteClick) {
          // SVG座標取得
          const svgElem = svg as SVGSVGElement;
          let x = 0,
            y = 0;
          if (svgElem && typeof note.getBoundingClientRect === "function") {
            const noteRect = note.getBoundingClientRect();
            const svgRect = svgElem.getBoundingClientRect();
            x = noteRect.left - svgRect.left + noteRect.width / 2;
            y = noteRect.bottom - svgRect.top;
          }
          onNoteClick(note.id, { x, y });
        }
      });
    });
    const handleMouseMove = (e: MouseEvent) => {
      const { noteId, startY } = dragState.current;
      if (noteId) {
        const deltaY = startY - e.clientY;
        if (Math.abs(deltaY) > 5 && onNoteMove) {
          const steps = Math.sign(deltaY);
          onNoteMove(noteId, steps);
          dragState.current.startY = e.clientY;
        }
      }
    };
    const handleMouseUp = () => {
      dragState.current.noteId = null;
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [svgOutput, onNoteClick, onNoteMove]);

  // 選択音符のハイライト
  useEffect(() => {
    if (!containerRef.current) return;
    const notes = containerRef.current.querySelectorAll(".note");
    notes.forEach((note) => {
      if (selectedNoteId && note.id === selectedNoteId) {
        note.setAttribute("fill", "red");
      } else {
        note.setAttribute("fill", "");
      }
    });
  }, [selectedNoteId, svgOutput]);

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
