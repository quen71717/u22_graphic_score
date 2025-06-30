import React, { useRef, useEffect, useState, useCallback } from "react";
import { useIntegratedScore } from "../context/IntegratedScoreContext";

interface DrawableCanvasProps {
  resetKey?: number;
}

const CANVAS_CONFIG = {
  width: 1000,
  height: 2000,
  trebleClefImagePath: "/images/20131.png",
  initialY: 50,
  lineInterval: 20,
  staffInterval: 200,
  numStaves: 10,
  clefX: 30,
};

const DrawableCanvas: React.FC<DrawableCanvasProps> = ({
  resetKey,
}) => {
  const { drawnCoordinates, setDrawnCoordinates, generateScoreFromDrawing } =
    useIntegratedScore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 2000 });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastPosition, setLastPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clefImageLoaded, setClefImageLoaded] = useState<boolean>(false);
  const clefImageRef = useRef<HTMLImageElement | null>(null);

  // ResizeObserverで親要素のサイズを監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resize = () => {
      setCanvasSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    resize();

    const observer = new window.ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 水平線の描画
  const drawHorizontalLine = useCallback(
    (ctx: CanvasRenderingContext2D, y: number) => {
      ctx.beginPath();
      ctx.moveTo(CANVAS_CONFIG.clefX, y);
      ctx.lineTo(CANVAS_CONFIG.width, y);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    []
  );

  // 五線譜の描画
  const drawFiveLinedStaff = useCallback(
    (ctx: CanvasRenderingContext2D, startY: number) => {
      for (let i = 0; i < 5; i++) {
        drawHorizontalLine(ctx, startY + i * CANVAS_CONFIG.lineInterval);
      }
    },
    [drawHorizontalLine]
  );

  // 五線譜とクレフの描画
  const drawStaffWithClef = useCallback(
    (ctx: CanvasRenderingContext2D) => {
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
    if (!ctx) return;

    // Canvasのクリア
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // 五線譜とクレフの描画
    drawStaffWithClef(ctx);
  }, [canvasSize, drawStaffWithClef]);

  // resetKeyが変わったらキャンバスを初期化
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    drawStaffWithClef(ctx);
  }, [resetKey, drawStaffWithClef]);

  // マウス位置の取得
  const getMousePosition = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return { x: 0, y: 0 };

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    []
  );

  // 描画開始
  const startDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getMousePosition(event);
      setIsDrawing(true);
      setLastPosition(pos);

      // 座標の記録を開始
      setDrawnCoordinates([pos]);
    },
    [getMousePosition, setDrawnCoordinates]
  );

  // 描画処理
  const draw = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !lastPosition || !canvasRef.current) return;

      const currentPosition = getMousePosition(event);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(currentPosition.x, currentPosition.y);
      ctx.stroke();

      setLastPosition(currentPosition);

      // 座標を記録
      setDrawnCoordinates((prev) => [...prev, currentPosition]);
    },
    [isDrawing, lastPosition, getMousePosition, setDrawnCoordinates]
  );

  // 描画終了
  const endDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPosition(null);

      // 描画終了時に楽譜を生成
      generateScoreFromDrawing();
    }
  }, [isDrawing, generateScoreFromDrawing]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        className="border border-gray-300 dark:border-gray-700 bg-white"
        style={{ touchAction: "none", width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DrawableCanvas;
