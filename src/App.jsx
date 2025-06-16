import React, { useState, useCallback } from "react";
import DrawableCanvas from "./components/DrawableCanvas";
import "./style.css";

export const CANVAS_CONFIG = {
  width: 1000,
  height: 2000,
  trebleClefImagePath: "/images/20131.png",
  initialY: 50,
  lineInterval: 20,
  staffInterval: 200,
  numStaves: 10,
  clefX: 30,
};

export const NOTES = {
  C3: 0,
  D3: 1,
  E3: 2,
  F3: 3,
  G3: 4,
  A3: 5,
  B3: 6,
  C4: 7,
  D4: 8,
  E4: 9,
  F4: 10,
  G4: 11,
  A4: 12,
  B4: 13,
};

const NOTE_MIN_INTERVAL = 20;

function App() {
  // canvasでmouusemoveが起こるたびに追加される座標{x, y}の値
  const [drawnCoordinates, setDrawnCoordinates] = useState([]);

  // DrawableCanvasから描画座標を受け取るコールバック関数
  const handleMouseMove = useCallback((coords) => {
    setDrawnCoordinates((prevCoords) => [...prevCoords, coords]);
    // console.log('Drawn at:', coords);
  }, []);

  const handleMouseLeave = () => {
    console.log("描画終了");
    const coords = drawnCoordinates.sort((a, b) => a.x - b.x);
    console.log(coords);
    const sample = downsampleCoordinates(coords);
    console.log("ダウンサンプリング");
    console.log(sample);
    const pitches = sample.map((coord) => {
      return calculatePitch(CANVAS_CONFIG.initialY, coord.y);
    });
    console.log("ピッチ計算");
    console.log(pitches);
  };

  // 間引くやつ
  const downsampleCoordinates = (coords) => {
    const sample = [coords[0]];
    let lastX = coords[0].x;

    for (let i = 1; i < coords.length; i++) {
      if (lastX + NOTE_MIN_INTERVAL <= coords[i].x) {
        sample.push(coords[i]);
        lastX = coords[i].x;
      }
    }

    return sample;
  };

  const calculatePitch = (offset, y) => {
    const normalizedY = y - offset;
    // ピッチを計算するための基準値, C3が10個目のピッチのため
    const pitch =
      10 - Math.round((normalizedY - CANVAS_CONFIG.lineInterval / 4) / 10);

    const note = Object.keys(NOTES).find((key) => {
      return NOTES[key] === pitch;
    });
    return note || "Unknown Pitch";
  };

  // console.log(drawnCoordinates);

  /*
    1. x座標でソート (行って戻るみたいな線に対応したい)
    2. 標本化 (幅は要検討，8分に分割したい)
    3. 線の高さをもとにピッチを計算
  */

  return (
    <div className="app-container">
      <h1>キャンバス</h1>
      <div className="canvas-wrapper">
        <DrawableCanvas
          handleMouseMove={handleMouseMove}
          handleMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
}

export default App;
