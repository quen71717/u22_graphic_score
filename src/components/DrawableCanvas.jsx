import React, { useRef, useEffect, useState } from 'react';

    // キャンバスのサイズと
    const canvasWidth = 1000;
    const canvasHeight = 2000;
    const trebleClefImagePath = "/images/to-onkigou.png";
    const initialY = 50;
    const lineInterval = 20;
    const staffInterval = 200;
    const numStaves = 10;
    const clefX = -50;


const DrawableCanvas = ({ onDraw }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPosition, setLastPosition] = useState(null);

    // 背景（五線譜とト音記号）の描画
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Canvasのクリア
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);


        const drawHorizontalLine = (y) => {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.stroke();
        };

        const fiveLinedStaff = (startY) => {
            for (let i = 0; i < 5; i++) {
                drawHorizontalLine(startY + i * lineInterval);
            }
        };

        const clefImage = new Image();
        clefImage.src = trebleClefImagePath;
        let clefImageLoaded = false;

        const drawPage = () => {
            for (let i = 0; i < numStaves; i++) {
                const currentStaffY = initialY + i * staffInterval;
                fiveLinedStaff(currentStaffY);
                if (clefImageLoaded) {
                    ctx.drawImage(clefImage, clefX + 20, currentStaffY - lineInterval * 1.5, clefImage.width * 0.1, clefImage.height * 0.1); // サイズ調整例
                } else if (trebleClefImagePath !== "/images/to-onkigou.png") {
                    console.warn(`Treble clef image not loaded yet: ${trebleClefImagePath}`);
                }
            }
        };

        clefImage.onload = () => {
            clefImageLoaded = true;
            drawPage();
        };
        clefImage.onerror = () => {
            console.error(`Failed to load treble clef image: ${trebleClefImagePath}`);
            drawPage();
        }

        drawPage();

    }, [trebleClefImagePath, initialY, lineInterval, staffInterval, numStaves, clefX]);
    const getMousePosition = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const startDrawing = (event) => {
        const pos = getMousePosition(event);
        setIsDrawing(true);
        setLastPosition(pos);
    };

    const draw = (event) => {
        if (!isDrawing) return;

        const currentPosition = getMousePosition(event);
        if (lastPosition) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.moveTo(lastPosition.x, lastPosition.y);
            ctx.lineTo(currentPosition.x, currentPosition.y);
            ctx.stroke();
        }
        setLastPosition(currentPosition);
        if (onDraw) {
            onDraw(currentPosition);
        }
    };

    const endDrawing = () => {
        setIsDrawing(false);
        setLastPosition(null);
    };

    return (
        <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            style={{ border: '1px solid #ccc', touchAction: 'none' }}
        />
    );
};

export default DrawableCanvas;