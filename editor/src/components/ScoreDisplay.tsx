import React, { useRef, useEffect, useState } from "react";
import { useScore } from "../context/ScoreContext";
import NoteDurationControls from "./NoteDurationControls";

const ScoreDisplay: React.FC = () => {
  const { svgOutput, moveNoteByStep } = useScore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !svgOutput) return;

    // Insert the SVG into the container
    containerRef.current.innerHTML = svgOutput;

    // Make the SVG responsive
    const svg = containerRef.current.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", "100%");
      svg.style.height = "auto"; // 高さはCSSで設定
      svg.style.display = "block";
    }

    // Add handlers for note interaction
    const notes = containerRef.current.querySelectorAll(".note");
    notes.forEach((note) => {
      note.classList.add("cursor-pointer", "hover:opacity-80");

      // ハイライト表示の復元
      if (selectedNoteId === note.id) {
        note.setAttribute("fill", "red");
      }

      // クリックハンドラ
      note.addEventListener("click", (e) => {
        e.stopPropagation();

        // 以前に選択された音符のハイライトを解除
        if (selectedNoteId) {
          const prevNote = containerRef.current?.querySelector(
            `#${selectedNoteId}`
          );
          if (prevNote) {
            prevNote.setAttribute("fill", "");
          }
        }

        // 新しい音符を選択してハイライト
        note.setAttribute("fill", "red");
        setSelectedNoteId(note.id);
        console.log("Note selected:", note.id);
      });

      // ドラッグ開始ハンドラを修正
      note.addEventListener("mousedown", (event) => {
        const e = event as MouseEvent;
        // 選択状態のチェックを削除して、どの音符でもドラッグ可能に
        setSelectedNoteId(note.id); // クリックした音符を自動選択
        note.setAttribute("fill", "red"); // 視覚的フィードバック
        setIsDragging(true);
        setStartY(e.clientY);
        e.preventDefault();
        e.stopPropagation(); // イベント伝播を停止
      });
    });

    // SVG領域でのドラッグ移動とドラッグ終了のハンドラを修正
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedNoteId) {
        const deltaY = startY - e.clientY;

        // デバッグログを追加
        console.log("Dragging:", { deltaY, selectedNoteId });

        // 感度を下げる（小さな移動でも反応するように）
        if (Math.abs(deltaY) > 5) {
          // 10から5に変更
          const steps = Math.sign(deltaY); // 符号のみを使用して1単位ずつ移動
          console.log("Moving note:", { steps, noteId: selectedNoteId });
          moveNoteByStep(selectedNoteId, steps);
          setStartY(e.clientY); // 新しい開始位置を設定
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // クリーンアップ関数
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [svgOutput, selectedNoteId, isDragging, startY, moveNoteByStep]);

  // SVGコンテナ以外のクリックで選択解除
  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && selectedNoteId) {
      const selectedNote = containerRef.current?.querySelector(
        `#${selectedNoteId}`
      );
      if (selectedNote) {
        selectedNote.setAttribute("fill", "");
      }
      setSelectedNoteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-50 dark:bg-blue-900 p-2 text-sm text-blue-800 dark:text-blue-200 border-b border-blue-200 dark:border-blue-800">
        <p>
          8分音符以上の短い音符は自動的に連桁で繋がれます。特定の音符の連桁を制御するには、音符を選択して下部のコントロールを使用してください。
        </p>
      </div>

      <div
        className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-850 transition-colors duration-300"
        onClick={handleContainerClick}
      >
        <div ref={containerRef} className="score-container mx-auto" />
      </div>

      {selectedNoteId && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <NoteDurationControls selectedNoteId={selectedNoteId} />
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
