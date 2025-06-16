import React, { createContext, useState, useContext, useEffect } from "react";
import verovio from "verovio";
import { convertNotesToMEI } from "../utils/notationConverter";

export type Coordinate = {
  x: number;
  y: number;
};

export type NoteInfo = {
  pitch: string;
  position: number;
};

interface IntegratedScoreContextType {
  // 図形譜関連
  drawnCoordinates: Coordinate[];
  setDrawnCoordinates: React.Dispatch<React.SetStateAction<Coordinate[]>>;
  processedNotes: NoteInfo[];

  // Verovio関連
  scoreData: string;
  setScoreData: (data: string) => void;
  svgOutput: string;
  toolkit: any;
  scale: number;
  zoomIn: () => void;
  zoomOut: () => void;

  // 統合機能
  generateScoreFromDrawing: () => void;
  resetDrawing: () => void;

  // 読み込み状態
  isVerovioReady: boolean;
}

const defaultMeiScore = `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
  <meiHead>
    <fileDesc>
      <titleStmt>
        <title>図形譜から生成</title>
      </titleStmt>
    </fileDesc>
  </meiHead>
  <music>
    <body>
      <mdiv>
        <score>
          <scoreDef meter.count="4" meter.unit="4" key.sig="0">
            <staffGrp>
              <staffDef n="1" clef.shape="G" clef.line="2" lines="5"/>
            </staffGrp>
          </scoreDef>
          <section>
            <measure n="1">
              <staff n="1">
                <layer n="1">
                </layer>
              </staff>
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;

const IntegratedScoreContext = createContext<IntegratedScoreContextType>({
  drawnCoordinates: [],
  setDrawnCoordinates: () => {},
  processedNotes: [],
  scoreData: defaultMeiScore,
  setScoreData: () => {},
  svgOutput: "",
  toolkit: null,
  scale: 40,
  zoomIn: () => {},
  zoomOut: () => {},
  generateScoreFromDrawing: () => {},
  resetDrawing: () => {},
  isVerovioReady: false,
});

export const useIntegratedScore = () => useContext(IntegratedScoreContext);

export const IntegratedScoreProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // 図形譜状態
  const [drawnCoordinates, setDrawnCoordinates] = useState<Coordinate[]>([]);
  const [processedNotes, setProcessedNotes] = useState<NoteInfo[]>([]);

  // Verovio状態
  const [scoreData, setScoreData] = useState<string>(defaultMeiScore);
  const [svgOutput, setSvgOutput] = useState<string>("");
  const [toolkit, setToolkit] = useState<any>(null);
  const [scale, setScale] = useState<number>(40);
  const [isVerovioReady, setIsVerovioReady] = useState<boolean>(false);

  // Verovioの初期化
  useEffect(() => {
    const waitForSuccessfulToolkitConstruction = async (
      toolkitConstructor: any
    ): Promise<any> => {
      while (true) {
        try {
          const instance = new toolkitConstructor();
          return instance;
        } catch (error) {
          console.warn("Toolkit construction failed; retrying...", error);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    };

    const initializeVerovio = async () => {
      try {
        console.log("Verovio is ready");
        const toolkitConstructor = verovio.toolkit;
        if (!toolkitConstructor) {
          throw new Error("Toolkit constructor is not available.");
        }

        const tk = await waitForSuccessfulToolkitConstruction(
          toolkitConstructor
        );
        setToolkit(tk);
        setIsVerovioReady(true);
      } catch (error) {
        console.error("Failed to initialize Verovio toolkit:", error);
      }
    };

    initializeVerovio();
  }, []);

  // 楽譜レンダリング
  useEffect(() => {
    if (!toolkit || !scoreData) return;

    try {
      toolkit.setOptions({
        scale: scale,
        adjustPageHeight: true,
        footer: "none",
        header: "none",
      });

      toolkit.loadData(scoreData);
      const svg = toolkit.renderToSVG(1);
      setSvgOutput(svg);
    } catch (error) {
      console.error("Error rendering score:", error);
    }
  }, [toolkit, scoreData, scale]);

  // ズーム関数
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 5, 100));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 5, 20));
  };

  // 図形譜データから楽譜を生成
  const generateScoreFromDrawing = () => {
    if (!toolkit || drawnCoordinates.length === 0) return;

    try {
      // 座標を処理
      const sortedCoords = [...drawnCoordinates].sort((a, b) => a.x - b.x);

      // 間引きと音符情報への変換
      const downsampledCoords = downsampleCoordinates(sortedCoords);
      const notes = downsampledCoords.map((coord) => {
        return calculateNoteInfo(coord);
      });

      setProcessedNotes(notes);

      // MEIデータに変換
      const mei = convertNotesToMEI(notes);
      setScoreData(mei);

      console.log("Generated score from drawing:", notes);
    } catch (error) {
      console.error("Error generating score:", error);
    }
  };

  // 座標の間引き処理
  const downsampleCoordinates = (coords: Coordinate[]): Coordinate[] => {
    if (coords.length === 0) return [];

    const NOTE_MIN_INTERVAL = 20;
    const sample: Coordinate[] = [coords[0]];
    let lastX = coords[0].x;

    for (let i = 1; i < coords.length; i++) {
      if (lastX + NOTE_MIN_INTERVAL <= coords[i].x) {
        sample.push(coords[i]);
        lastX = coords[i].x;
      }
    }

    return sample;
  };

  // 座標から音符情報を計算
  const calculateNoteInfo = (coord: Coordinate): NoteInfo => {
    const NOTES: Record<string, number> = {
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

    const CANVAS_CONFIG = {
      initialY: 50,
      lineInterval: 20,
    };

    const normalizedY = coord.y - CANVAS_CONFIG.initialY;
    const pitch =
      NOTES.F4 -
      Math.round((normalizedY - CANVAS_CONFIG.lineInterval / 4) / 10);

    const noteName =
      Object.keys(NOTES).find((key) => NOTES[key] === pitch) || "C4";

    return {
      pitch: noteName,
      position: coord.x,
    };
  };

  // 描画をリセット
  const resetDrawing = () => {
    setDrawnCoordinates([]);
    setProcessedNotes([]);
    setScoreData(defaultMeiScore);
  };

  return (
    <IntegratedScoreContext.Provider
      value={{
        drawnCoordinates,
        setDrawnCoordinates,
        processedNotes,
        scoreData,
        setScoreData,
        svgOutput,
        toolkit,
        scale,
        zoomIn,
        zoomOut,
        generateScoreFromDrawing,
        resetDrawing,
        isVerovioReady,
      }}
    >
      {children}
    </IntegratedScoreContext.Provider>
  );
};
