import React, { useRef, useEffect, useState, useCallback } from "react";
import { CANVAS_CONFIG } from "../App";

const DrawableCanvas = ({ handleMouseMove, handleMouseLeave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [clefImageLoaded, setClefImageLoaded] = useState(false);
  const clefImageRef = useRef(null);

  // 描画関連の関数をコンポーネントのトップレベルで定義
  const drawHorizontalLine = useCallback((ctx, y) => {
    ctx.beginPath();
    ctx.moveTo(CANVAS_CONFIG.clefX, y);
    ctx.lineTo(CANVAS_CONFIG.width, y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, []);

  const drawFiveLinedStaff = useCallback(
    (ctx, startY) => {
      for (let i = 0; i < 5; i++) {
        drawHorizontalLine(ctx, startY + i * CANVAS_CONFIG.lineInterval);
      }
    },
    [drawHorizontalLine]
  );

  const drawStaffWithClef = useCallback(
    (ctx) => {
      for (let i = 0; i < CANVAS_CONFIG.numStaves; i++) {
        const currentStaffY =
          CANVAS_CONFIG.initialY + i * CANVAS_CONFIG.staffInterval;
        drawFiveLinedStaff(ctx, currentStaffY);

        if (clefImageLoaded && clefImageRef.current) {
          // 20131.pngの画像基準での調整
          const targetHeight = CANVAS_CONFIG.lineInterval * 7;
          const scale = targetHeight / 2771;
          const targetWidth = 1041 * scale;
          const yOffset =
            currentStaffY - targetHeight / 2 + CANVAS_CONFIG.lineInterval * 2;
          ctx.drawImage(
            clefImageRef.current,
            CANVAS_CONFIG.clefX,
            yOffset,
            targetWidth,
            targetHeight
          );
        }
      }
    },
    [drawFiveLinedStaff, clefImageLoaded]
  );

  // クレフ画像の読み込み
  useEffect(() => {
    const clefImage = new Image();
    clefImageRef.current = clefImage;

    clefImage.onload = () => {
      setClefImageLoaded(true);
    };

    clefImage.onerror = () => {
      console.error(
        `Failed to load treble clef image: ${CANVAS_CONFIG.trebleClefImagePath}`
      );
    };

    clefImage.src = CANVAS_CONFIG.trebleClefImagePath;

    // クリーンアップ関数
    return () => {
      clefImage.onload = null;
      clefImage.onerror = null;
    };
  }, []);

  // キャンバスの描画
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Canvasのクリア
    ctx.clearRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);

    // 五線譜とクレフの描画
    drawStaffWithClef(ctx);
  }, [drawStaffWithClef]); // 依存配列を最適化

  // マウス位置の取得
  const getMousePosition = useCallback((event) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  // 描画開始
  const startDrawing = useCallback(
    (event) => {
      const pos = getMousePosition(event);
      setIsDrawing(true);
      setLastPosition(pos);
    },
    [getMousePosition]
  );

  // 描画処理
  const draw = useCallback(
    (event) => {
      if (!isDrawing || !lastPosition || !canvasRef.current) return;

      const currentPosition = getMousePosition(event);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(currentPosition.x, currentPosition.y);
      ctx.stroke();

      setLastPosition(currentPosition);

      if (handleMouseMove) {
        handleMouseMove(currentPosition);
      }
    },
    [isDrawing, lastPosition, getMousePosition, handleMouseMove]
  );

  // 描画終了
  const endDrawing = useCallback(() => {
    setIsDrawing(false);
    setLastPosition(null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_CONFIG.width}
      height={CANVAS_CONFIG.height}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={() => {
        endDrawing();
        handleMouseLeave();
      }}
      onMouseLeave={endDrawing}
      style={{ border: "1px solid #ccc", touchAction: "none" }}
    />
  );
};

export default DrawableCanvas;
