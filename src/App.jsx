import React, { useState, useCallback } from 'react';
import DrawableCanvas from './components/DrawableCanvas';
import './style.css';

function App() {
  const [drawnCoordinates, setDrawnCoordinates] = useState([]);

  // DrawableCanvasから描画座標を受け取るコールバック関数
  const handleDraw = useCallback((coords) => {
    setDrawnCoordinates(prevCoords => [...prevCoords, coords]);
    // console.log('Drawn at:', coords);
  }, []);


  return (
    <div className="app-container">
      <h1>キャンバス</h1>
      <div className="canvas-wrapper">
        <DrawableCanvas onDraw={handleDraw} />
      </div>
    </div>
  );
}

export default App;