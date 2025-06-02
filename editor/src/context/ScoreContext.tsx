import React, { createContext, useState, useContext, useEffect } from "react";
import verovio from "verovio";

interface ScoreContextType {
  scoreData: string;
  setScoreData: (data: string) => void;
  svgOutput: string;
  toolkit: any | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  navigateToPage: (page: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  moveNoteByStep: (noteId: string, steps: number) => void;
  changeNoteDuration: (noteId: string, duration: string) => void;
  addBeam: (noteId: string, count?: number) => void;
  removeBeam: (noteId: string) => void;
  saveMEI: () => void;
  saveMusicXML: () => void;
  saveMIDI: () => void;
}

const ScoreContext = createContext<ScoreContextType>({
  scoreData: "",
  setScoreData: () => {},
  svgOutput: "",
  toolkit: null,
  currentPage: 1,
  totalPages: 1,
  scale: 40,
  navigateToPage: () => {},
  zoomIn: () => {},
  zoomOut: () => {},
  moveNoteByStep: () => {},
  changeNoteDuration: () => {},
  addBeam: () => {},
  removeBeam: () => {},
  saveMEI: () => {},
  saveMusicXML: () => {},
  saveMIDI: () => {},
});

export const useScore = () => useContext(ScoreContext);

const defaultMeiScore = `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
  <meiHead>
    <fileDesc>
      <titleStmt>
        <title>New Score</title>
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
                  <note pname="c" oct="4" dur="4"/>
                  <note pname="d" oct="4" dur="4"/>
                  <note pname="e" oct="4" dur="4"/>
                  <note pname="f" oct="4" dur="4"/>
                </layer>
              </staff>
            </measure>
            <measure n="2">
              <staff n="1">
                <layer n="1">
                  <note pname="g" oct="4" dur="4"/>
                  <note pname="a" oct="4" dur="4"/>
                  <note pname="b" oct="4" dur="4"/>
                  <note pname="c" oct="5" dur="4"/>
                </layer>
              </staff>
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;

export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scoreData, setScoreData] = useState<string>(defaultMeiScore);
  const [svgOutput, setSvgOutput] = useState<string>("");
  const [toolkit, setToolkit] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(40);

  // Initialize Verovio toolkit with waiting for WASM module to be ready
  useEffect(() => {
    const waitForSuccessfulToolkitConstruction = async (
      toolkitConstructor: any
    ): Promise<any> => {
      while (true) {
        try {
          // 一度インスタンスを生成してみる
          const instance = new toolkitConstructor();
          // 生成に成功したら破棄してポーリング終了
          return instance;
        } catch (error) {
          console.warn("Toolkit construction failed; retrying...", error);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    };

    const initializeVerovio = async () => {
      try {
        // await verovio.ready;
        console.log("Verovio is ready via verovio.ready");
        const toolkitConstructor = verovio.toolkit;
        if (!toolkitConstructor) {
          throw new Error("Toolkit constructor is not available.");
        }
        // 安全にインスタンス生成できるまでポーリング

        console.log("Toolkit constructor can be called without errors");
        const tk = await waitForSuccessfulToolkitConstruction(
          toolkitConstructor
        );
        setToolkit(tk);
      } catch (error) {
        console.error("Failed to initialize Verovio toolkit:", error);
      }
    };

    initializeVerovio();
  }, []);

  // Render score when toolkit, score data, or zoom level changes
  useEffect(() => {
    if (!toolkit || !scoreData) return;

    try {
      toolkit.setOptions({
        scale: scale,
        adjustPageHeight: true,
        footer: "none",
      });

      toolkit.loadData(scoreData);

      const pages = toolkit.getPageCount();
      setTotalPages(pages);

      const validPage = Math.min(currentPage, pages);
      if (validPage !== currentPage) {
        setCurrentPage(validPage);
      }

      const svg = toolkit.renderToSVG(validPage);
      setSvgOutput(svg);
    } catch (error) {
      console.error("Error rendering score:", error);
    }
  }, [toolkit, scoreData, scale, currentPage]);

  // Navigation functions
  const navigateToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 5, 100));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 5, 20));
  };

  // Function to move a note by a specified number of steps
  const moveNoteByStep = (noteId: string, steps: number) => {
    if (!toolkit || !scoreData) return;

    console.log("moveNoteByStep called:", { noteId, steps });

    try {
      // Verovioから現在のMEIデータを取得
      const mei = toolkit.getMEI();

      // 正規表現を使用して全ての音符要素を取得
      const notePattern = /<note\s+([^>]*)>/g;
      const allNotes = [...mei.matchAll(notePattern)];
      console.log(`Found ${allNotes.length} notes in the MEI data`);

      // SVG内の音符ID (n6op7t0など) からインデックスを特定する方法
      // ここでは音符のインデックスを取得するために別の方法を使用

      // SVG要素を取得
      const svgNote = document.getElementById(noteId);
      if (!svgNote) {
        console.error("SVG note element not found:", noteId);
        return;
      }

      // SVG要素のclassNameから情報を取得
      const classNames = svgNote.getAttribute("class")?.split(" ") || [];
      const noteClassInfo = classNames.find((c) => c.includes("note-"));
      console.log("Note class info:", noteClassInfo);

      // 音符の位置情報を解析（これはSVG特有の方法に依存）
      // ここでは簡易的に例として、SVG内の順序を使用

      // MEIデータ内の音符を直接修正
      const updatedMei = mei.replace(
        notePattern,
        (match: string, attrs: string) => {
          // 特定の音符のみを修正
          if (
            match.includes(noteId) ||
            (noteClassInfo && match.includes(noteClassInfo))
          ) {
            // 現在の音程と八度を取得
            const pnameMatch = /pname="([a-g])"/i.exec(attrs);
            const octMatch = /oct="(\d+)"/i.exec(attrs);

            if (pnameMatch && octMatch) {
              const pname = pnameMatch[1];
              const oct = parseInt(octMatch[1], 10);

              // Pitch order (C, D, E, F, G, A, B)
              const pitchOrder = ["c", "d", "e", "f", "g", "a", "b"];
              let pitchIndex = pitchOrder.indexOf(pname.toLowerCase());

              if (pitchIndex !== -1) {
                // Calculate new pitch and octave
                let newOct = oct;
                let newPitchIndex = pitchIndex + steps;

                // Handle octave boundaries
                while (newPitchIndex < 0) {
                  newPitchIndex += 7;
                  newOct -= 1;
                }
                while (newPitchIndex >= 7) {
                  newPitchIndex -= 7;
                  newOct += 1;
                }

                // Limit pitch range
                if (newOct < 0) newOct = 0;
                if (newOct > 8) newOct = 8;

                // 更新された属性を持つ音符を返す
                return match
                  .replace(
                    /pname="[a-g]"/i,
                    `pname="${pitchOrder[newPitchIndex]}"`
                  )
                  .replace(/oct="\d+"/i, `oct="${newOct}"`);
              }
            }
          }
          return match; // 変更なし
        }
      );

      console.log("Updated MEI data");
      // 更新されたMEIデータを設定
      setScoreData(updatedMei);
    } catch (error) {
      console.error("Error moving note:", error);
    }
  };

  // Function to change the duration of a note
  const changeNoteDuration = (noteId: string, duration: string) => {
    if (!toolkit || !scoreData) return;

    console.log("changeNoteDuration called:", { noteId, duration });

    try {
      // DOM形式でMEIデータを解析
      const mei = toolkit.getMEI();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(mei, "text/xml");

      // ヘルパー関数を使ってMEI内の音符要素を見つける
      const { noteElement, parentElement } = findMeiNoteElementById(
        noteId,
        xmlDoc
      );
      if (!noteElement || !parentElement) {
        console.error("Could not find note element in MEI data");
        return;
      }

      // 連桁対象外の音価
      const nonBeamableDurations = ["1", "2", "4"];

      // 音符が連桁内にあるかチェック
      const isInBeam = parentElement.nodeName.toLowerCase() === "beam";

      // 音価を更新
      noteElement.setAttribute("dur", duration);

      // 連桁内にあり、新しい音価が連桁対象外の場合
      if (isInBeam && nonBeamableDurations.includes(duration)) {
        console.log("Removing note from beam due to duration change");

        // ビーム要素とその親
        const beamElement = parentElement;
        const beamParent = beamElement.parentElement;

        if (!beamParent) {
          console.error("Beam has no parent");
          return;
        }

        // ビーム内の全ての音符を取得して、位置関係を把握
        const allNotesInBeam = Array.from(
          beamElement.getElementsByTagName("note")
        );
        const noteIndex = allNotesInBeam.indexOf(noteElement as Element);
        console.log(
          `Note is at position ${noteIndex + 1} of ${
            allNotesInBeam.length
          } in beam`
        );

        // 中央の音符を変更した場合は、連桁全体を解除する必要がある
        // 先頭・末尾の変更の場合は、その音符だけ取り出す
        const isMiddleNote =
          noteIndex > 0 && noteIndex < allNotesInBeam.length - 1;

        if (isMiddleNote || allNotesInBeam.length <= 2) {
          // 中央の音符の変更、または2つ以下の音符で構成される連桁の場合
          // 連桁全体を解除する
          console.log(
            "Breaking beam due to middle note duration change or small beam"
          );

          // ビームの位置を記録
          const beamPosition = Array.from(beamParent.children).indexOf(
            beamElement
          );

          // ビーム内のすべての音符を保存して、順序を維持
          const notesToPreserve = Array.from(
            beamElement.getElementsByTagName("note")
          );

          // 音符の要素はnodeListから削除するとインデックスが変わるため先に保存
          const notePositions = notesToPreserve.map((_, index) => index);

          // ビーム要素の次の要素（挿入位置の参照用）
          const insertBeforeNode = beamElement.nextElementSibling;

          // 各音符をビームから取り出して、正しい位置に配置
          notePositions.forEach((pos) => {
            // 音符を取得（常に最初の要素を取得する）
            const note = beamElement.getElementsByTagName("note")[0];
            if (!note) return;

            // ビームから取り出す
            beamElement.removeChild(note);

            // 適切な位置に挿入
            if (insertBeforeNode) {
              beamParent.insertBefore(note, insertBeforeNode);
            } else {
              beamParent.appendChild(note);
            }
          });

          // 空になったビーム要素を削除
          beamParent.removeChild(beamElement);
        } else {
          // 先頭または末尾の音符の場合、その音符だけを取り出す
          // 既存のコードを使用
          // ビームから音符を取り出す
          beamElement.removeChild(noteElement);

          // 元のビーム位置に基づいて正しい位置に挿入する処理（既存のコード）
          if (noteIndex === 0) {
            // 最初の音符だった場合、ビームの前に挿入
            beamParent.insertBefore(noteElement, beamElement);
          } else {
            // その他の場合（末尾など）
            const nextElement = beamElement.nextElementSibling;
            if (nextElement) {
              beamParent.insertBefore(noteElement, nextElement);
            } else {
              beamParent.appendChild(noteElement);
            }
          }

          // ビーム内に残った音符が1つ以下の場合、ビームを解除（既存のコード）
          const remainingNotes = beamElement.getElementsByTagName("note");
          if (remainingNotes.length <= 1) {
            const notesToPreserve = Array.from(remainingNotes);

            const currentBeamPosition = Array.from(beamParent.children).indexOf(
              beamElement
            );

            notesToPreserve.forEach((note) => {
              beamElement.removeChild(note);
              const referenceNode =
                beamParent.children[currentBeamPosition] || null;
              if (referenceNode) {
                beamParent.insertBefore(note, referenceNode);
              } else {
                beamParent.appendChild(note);
              }
            });

            beamParent.removeChild(beamElement);
          }
        }
      }

      // 変更されたMEIデータを文字列に戻して設定
      const serializer = new XMLSerializer();
      const updatedMei = serializer.serializeToString(xmlDoc);
      setScoreData(updatedMei);

      console.log("Updated MEI data with new duration");
    } catch (error) {
      console.error("Error changing note duration:", error);
    }
  };

  // MEIノートを特定するヘルパー関数を作成
  const findMeiNoteElementById = (
    noteId: string,
    xmlDoc: Document
  ): { noteElement: Element | null; parentElement: Element | null } => {
    // SVG要素を取得
    const svgNote = document.getElementById(noteId);
    if (!svgNote) {
      console.error("SVG note element not found:", noteId);
      return { noteElement: null, parentElement: null };
    }

    // SVG要素の属性からMEIデータへの手がかりを取得
    const classNames = svgNote.getAttribute("class")?.split(" ") || [];
    console.log("SVG note element classes:", classNames);

    // SVGノートのすべての属性をデバッグ出力
    console.log(
      "SVG note attributes:",
      Array.from(svgNote.attributes).map((attr) => `${attr.name}=${attr.value}`)
    );

    // SVGノートの位置情報を取得
    const svgRect = svgNote.getBoundingClientRect();
    const notePosition = {
      x: svgRect.x + svgRect.width / 2,
      y: svgRect.y + svgRect.height / 2,
    };
    console.log("Note position:", notePosition);

    // アプローチ1: データ属性からMEI IDを取得
    const dataId =
      svgNote.getAttribute("data-id") ||
      svgNote.getAttribute("data-mei-id") ||
      svgNote.getAttribute("id");

    // アプローチ3: すべての音符を取得し、順序で一致させる
    const allSvgNotes = Array.from(document.querySelectorAll(".note"));
    const noteIndex = allSvgNotes.indexOf(svgNote);
    console.log(`This is note ${noteIndex + 1} of ${allSvgNotes.length}`);

    // MEI内のすべての音符要素を取得
    const allMeiNotes = xmlDoc.querySelectorAll("note");
    console.log(`Found ${allMeiNotes.length} notes in MEI data`);

    // 対応するインデックスの音符を取得（インデックスが一致する場合）
    let noteElement = null;
    if (noteIndex >= 0 && noteIndex < allMeiNotes.length) {
      noteElement = allMeiNotes[noteIndex];
      console.log("Found note by index:", {
        pname: noteElement.getAttribute("pname"),
        oct: noteElement.getAttribute("oct"),
        dur: noteElement.getAttribute("dur"),
      });
    }

    // データ属性からの検索も試みる
    if (!noteElement && dataId) {
      noteElement =
        xmlDoc.querySelector(`note[xml\\:id="${dataId}"]`) ||
        xmlDoc.querySelector(`note[id="${dataId}"]`);
    }

    // ノートが見つからない場合
    if (!noteElement) {
      console.error("Could not find matching note in MEI data");
      return { noteElement: null, parentElement: null };
    }

    // 親要素を取得
    const parentElement = noteElement.parentElement;
    if (!parentElement) {
      console.error("Note has no parent element");
      return { noteElement, parentElement: null };
    }

    return { noteElement, parentElement };
  };

  // 修正後のaddBeam関数
  const addBeam = (noteId: string, count: number = 2) => {
    if (!toolkit || !scoreData) return;

    try {
      console.log("Adding beam using direct MEI manipulation:", noteId);

      // MEIデータを取得してDOM形式に解析
      const mei = toolkit.getMEI();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(mei, "text/xml");

      // MEIノート要素を見つける
      const { noteElement, parentElement } = findMeiNoteElementById(
        noteId,
        xmlDoc
      );
      if (!noteElement || !parentElement) {
        return;
      }

      // 現在の親が既にbeamの場合は何もしない
      if (parentElement.nodeName === "beam") {
        console.log("Note is already part of a beam");
        return;
      }

      // 指定数の音符を集める (最初の音符 + (count-1)個の追加音符)
      const notesToBeam: Element[] = [noteElement];
      let currentNote = noteElement;

      // 次の音符を探して追加 (count-1個)
      for (let i = 1; i < count; i++) {
        let nextNote = currentNote.nextElementSibling;
        while (nextNote && nextNote.nodeName !== "note") {
          nextNote = nextNote.nextElementSibling;
        }

        if (!nextNote) {
          console.error(
            `Could only find ${notesToBeam.length} notes to beam, needed ${count}`
          );
          break;
        }

        notesToBeam.push(nextNote);
        currentNote = nextNote;
      }

      // 少なくとも2つの音符が必要
      if (notesToBeam.length < 2) {
        console.error("Need at least 2 notes to create a beam");
        return;
      }

      console.log(`Creating beam with ${notesToBeam.length} notes`);

      // すべての音符が8分音符以上の短い音価であることを確認
      const validDurations = ["8", "16", "32", "64"];
      const invalidNotes = notesToBeam.filter((note) => {
        const dur = note.getAttribute("dur");
        return !dur || !validDurations.includes(dur);
      });

      if (invalidNotes.length > 0) {
        console.error(
          "All notes must be eighth notes or shorter to apply beams"
        );
        alert(
          "ビームを適用するには全ての音符が8分音符以上の音価（8分、16分、32分など）が必要です"
        );
        return;
      }

      // 挿入ポイントを記憶（最後の音符の次の要素）
      const lastNote = notesToBeam[notesToBeam.length - 1];
      const insertBeforeNode = lastNote.nextElementSibling;

      // beam要素を作成
      const beamElement = xmlDoc.createElement("beam");

      // 親要素から対象の音符を取り外し、ビーム要素に追加
      notesToBeam.forEach((note) => {
        parentElement.removeChild(note);
        beamElement.appendChild(note);
      });

      // beam要素を正しい位置に挿入
      if (insertBeforeNode) {
        parentElement.insertBefore(beamElement, insertBeforeNode);
      } else {
        parentElement.appendChild(beamElement);
      }

      // XMLをシリアライズして文字列に戻す
      const serializer = new XMLSerializer();
      const updatedMei = serializer.serializeToString(xmlDoc);

      // 更新したMEIデータを設定
      setScoreData(updatedMei);
      console.log(`Beam added successfully for ${notesToBeam.length} notes`);
    } catch (error) {
      console.error("Error adding beam:", error);
    }
  };

  // 修正後のremoveBeam関数
  const removeBeam = (noteId: string) => {
    if (!toolkit || !scoreData) return;

    try {
      console.log("Removing beam using direct MEI manipulation:", noteId);

      // MEIデータを取得してDOM形式に解析
      const mei = toolkit.getMEI();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(mei, "text/xml");

      // MEIノート要素を見つける
      const { noteElement, parentElement } = findMeiNoteElementById(
        noteId,
        xmlDoc
      );
      if (!noteElement || !parentElement) {
        return;
      }

      // 親がビーム要素でなければ何もしない
      if (parentElement.nodeName.toLowerCase() !== "beam") {
        console.log("Note is not part of a beam");
        return;
      }

      // ビーム要素の親（layer）を取得
      const grandParentElement = parentElement.parentElement;
      if (!grandParentElement) {
        console.error("Beam has no parent element");
        return;
      }

      // ビーム内のすべての音符を取得
      const notesInBeam = Array.from(
        parentElement.getElementsByTagName("note")
      );
      console.log(`Found ${notesInBeam.length} notes in this beam`);

      // 元のビームの位置を記憶
      const insertBeforeNode = parentElement.nextElementSibling;

      // ビーム内の各音符を取り出して同じ順序で配置
      notesInBeam.forEach((note) => {
        // 音符のクローンを作成
        const noteClone = note.cloneNode(true);

        // 正しい位置に音符を挿入
        if (insertBeforeNode) {
          grandParentElement.insertBefore(noteClone, insertBeforeNode);
        } else {
          grandParentElement.appendChild(noteClone);
        }
      });

      // ビーム要素を削除
      grandParentElement.removeChild(parentElement);

      // XMLをシリアライズして文字列に戻す
      const serializer = new XMLSerializer();
      const updatedMei = serializer.serializeToString(xmlDoc);

      // 更新したMEIデータを設定
      setScoreData(updatedMei);
      console.log("Beam removed successfully");
    } catch (error) {
      console.error("Error removing beam:", error);
    }
  };

  // MEI形式で保存する関数
  const saveMEI = () => {
    if (!toolkit || !scoreData) {
      console.error("Toolkit or score data not available");
      return;
    }

    try {
      // 整形済みのMEIデータを取得
      const meiData = toolkit.getMEI();

      // Blobを作成してダウンロード
      const blob = new Blob([meiData], { type: "application/xml" });
      const url = URL.createObjectURL(blob);

      // ダウンロードリンクを作成
      const a = document.createElement("a");
      a.href = url;
      a.download = "score.mei";
      document.body.appendChild(a);
      a.click();

      // クリーンアップ
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save MEI file:", error);
    }
  };

  // MusicXML形式で保存する関数
  const saveMusicXML = () => {
    if (!toolkit || !scoreData) {
      console.error("Toolkit or score data not available");
      return;
    }

    try {
      // MEIからMusicXMLに変換
      const musicXMLData = toolkit.getMusicXML();

      // Blobを作成してダウンロード
      const blob = new Blob([musicXMLData], { type: "application/xml" });
      const url = URL.createObjectURL(blob);

      // ダウンロードリンクを作成
      const a = document.createElement("a");
      a.href = url;
      a.download = "score.musicxml";
      document.body.appendChild(a);
      a.click();

      // クリーンアップ
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save MusicXML file:", error);
    }
  };

  // Base64 を Uint8Array に変換するヘルパー関数
  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  };

  // MIDI形式で保存する関数（Base64 デコード版）
  const saveMIDI = () => {
    if (!toolkit || !scoreData) {
      console.error("Toolkit or score data not available");
      return;
    }

    try {
      // Verovio toolkitから MIDI データを取得（Base64 エンコードされた文字列）
      const midiStr = toolkit.renderToMIDI();

      // Base64 をデコードして Uint8Array に変換
      const midiData = base64ToUint8Array(midiStr);

      // Blob を作成してダウンロード（MIDIの場合は "audio/midi" を指定）
      const blob = new Blob([midiData], { type: "audio/midi" });
      const url = URL.createObjectURL(blob);

      // ダウンロードリンクを作成して自動クリック
      const a = document.createElement("a");
      a.href = url;
      a.download = "score.mid";
      document.body.appendChild(a);
      a.click();

      // クリーンアップ
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save MIDI file:", error);
    }
  };

  return (
    <ScoreContext.Provider
      value={{
        scoreData,
        setScoreData,
        svgOutput,
        toolkit,
        currentPage,
        totalPages,
        scale,
        navigateToPage,
        zoomIn,
        zoomOut,
        moveNoteByStep,
        changeNoteDuration,
        addBeam,
        removeBeam,
        saveMEI,
        saveMusicXML,
        saveMIDI, // ← 新規追加
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};
