import React, { useRef, useEffect, useState, useCallback } from "react";
import { useIntegratedScore } from "../context/IntegratedScoreContext";

interface DrawableCanvasProps {
  resetKey?: number;
}

// キャンバスと五線譜の設定を定義
export const CANVAS_CONFIG = {
  width: 1000,
  height: 2000,
  trebleClefImagePath: "/clef.png",
  initialY: 50, // 最初の五線譜のy座標
  lineInterval: 10, // 五線譜の線間隔
  staffInterval: 200, // 五線譜間の縦間隔
  staffYInterval: 170, // 五線譜間の横間隔
  // numStaves: 4,  // 五線譜の数
  numStavesRow: 2, // 行数（縦の段数）
  numStavesCol: 3, // 列数（横の五線譜数）
  clefX: 30, //ト音記号のx座標
};

const DrawableCanvas: React.FC<DrawableCanvasProps> = ({ resetKey }) => {
  const { setDrawnCoordinates, generateScoreFromDrawing } =
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

  // drawHorizontalLineをX座標指定
  const drawHorizontalLine = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      y: number,
      startX: number = CANVAS_CONFIG.clefX,
      endX: number = canvasSize.width - CANVAS_CONFIG.clefX
    ) => {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    [canvasSize.width]
  );

  // 五線譜の描画
  const drawStaffWithClef = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      for (let row = 0; row < CANVAS_CONFIG.numStavesRow; row++) {
        for (let col = 0; col < CANVAS_CONFIG.numStavesCol; col++) {
          const currentStaffX =
            CANVAS_CONFIG.clefX + col * CANVAS_CONFIG.staffYInterval;
          const currentStaffY =
            CANVAS_CONFIG.initialY + row * CANVAS_CONFIG.staffInterval;

          // 五線譜を横に描画
          for (let j = 0; j < 5; j++) {
            drawHorizontalLine(
              ctx,
              currentStaffY + j * CANVAS_CONFIG.lineInterval,
              currentStaffX,
              currentStaffX + 150
            );
          }

          // クレフ画像も横に配置
          if (clefImageLoaded && clefImageRef.current) {
            const targetHeight = CANVAS_CONFIG.lineInterval * 7;
            const scale = targetHeight / 2771;
            const targetWidth = 1041 * scale;
            const yOffset =
              currentStaffY - targetHeight / 2 + CANVAS_CONFIG.lineInterval * 2;
            ctx.drawImage(
              clefImageRef.current,
              currentStaffX,
              yOffset,
              targetWidth,
              targetHeight
            );
          }
        }
      }
    },
    [drawHorizontalLine, clefImageLoaded]
  );
  // // 五線譜とクレフの描画
  // const drawStaffWithClef = useCallback(
  //   (ctx: CanvasRenderingContext2D) => {
  //     for (let i = 0; i < CANVAS_CONFIG.numStaves; i++) {
  //       const currentStaffY =
  //         CANVAS_CONFIG.initialY + i * CANVAS_CONFIG.staffInterval;
  //       drawFiveLinedStaff(ctx, currentStaffY);

  //       if (clefImageLoaded && clefImageRef.current) {
  //         // 20131.pngの画像基準での調整
  //         const targetHeight = CANVAS_CONFIG.lineInterval * 7;
  //         const scale = targetHeight / 2771;
  //         const targetWidth = 1041 * scale;
  //         const yOffset =
  //           currentStaffY - targetHeight / 2 + CANVAS_CONFIG.lineInterval * 2;
  //         ctx.drawImage(
  //           clefImageRef.current,
  //           CANVAS_CONFIG.clefX,
  //           yOffset,
  //           targetWidth,
  //           targetHeight
  //         );
  //       }
  //     }
  //   },
  //   [drawFiveLinedStaff, clefImageLoaded]
  // );

  // // 水平線の描画
  // const drawHorizontalLine = useCallback(
  //   (ctx: CanvasRenderingContext2D, y: number) => {
  //     // 終点を始点からclefX分だけ短くする
  //     const startX = CANVAS_CONFIG.clefX;
  //     const endX = canvasSize.width - CANVAS_CONFIG.clefX;
  //     ctx.beginPath();
  //     ctx.moveTo(startX, y);
  //     ctx.lineTo(endX, y);
  //     ctx.strokeStyle = "#000000";
  //     ctx.lineWidth = 1;
  //     ctx.stroke();
  //   },
  //   [canvasSize.width]
  // );

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
      setDrawnCoordinates((prev) => [...prev, pos]);
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
