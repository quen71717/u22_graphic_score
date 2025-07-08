import { NoteInfo } from "../context/IntegratedScoreContext";

// 音符情報からMEIデータに変換する関数
export const convertNotesToMEI = (notes: NoteInfo[]): string => {
  if (notes.length === 0) {
    return getEmptyMEIScore();
  }

  // 拍数計算用のヘルパー
  const getDurationValue = (dur: string) => {
    switch (dur) {
      case "1":
        return 4;
      case "2":
        return 2;
      case "4":
        return 1;
      case "8":
        return 0.5;
      case "16":
        return 0.25;
      case "32":
        return 0.125;
      default:
        return 0.5;
    }
  };
  // 逆変換: 拍数から最適な音価durを返す
  const getBestDur = (beats: number) => {
    if (beats >= 4) return "1";
    if (beats >= 2) return "2";
    if (beats >= 1) return "4";
    if (beats >= 0.5) return "8";
    if (beats >= 0.25) return "16";
    return "32";
  };

  // notes: 分割前の元音符リスト
  // 小節分割・タイ・休符はここでのみ付与
  const MEASURE_BEATS = 4; // 4/4拍子
  let measureCount = 1;
  let currentBeats = 0;
  let measureNotes: string[] = [];
  let allMeasures: string[] = [];
  let tieIdCounter = 0;

  notes.forEach((note, index) => {
    let { pitch, duration } = note as any;
    const pname = pitch.charAt(0).toLowerCase();
    const oct = pitch.charAt(1);
    let dur = duration || "8";
    let beatsLeft = getDurationValue(dur);
    let first = true;
    let tieOpen = false;
    while (beatsLeft > 0) {
      const beatsInThisMeasure = Math.min(beatsLeft, MEASURE_BEATS - currentBeats);
      const thisDur = getBestDur(beatsInThisMeasure);
      const thisDurBeats = getDurationValue(thisDur);
      // xml:idはn{index}_{分割番号}だが、UI側はn{index}のみを使う
      let noteId = `n${index}`;
      let tieAttr = "";
      if (beatsLeft > thisDurBeats) {
        tieAttr = ' tie="i"';
        tieOpen = true;
      } else if (tieOpen) {
        tieAttr = ' tie="t"';
        tieOpen = false;
      }
      measureNotes.push(`\n                  <note xml:id="${noteId}" pname="${pname}" oct="${oct}" dur="${thisDur}"${tieAttr}/>`);
      currentBeats += thisDurBeats;
      beatsLeft -= thisDurBeats;
      first = false;
      if (currentBeats >= MEASURE_BEATS) {
        allMeasures.push(
          `<measure n="${measureCount}">\n  <staff n="1">\n    <layer n="1">${measureNotes.join("")}\n    </layer>\n  </staff>\n</measure>`
        );
        measureCount++;
        measureNotes = [];
        currentBeats = 0;
      }
    }
  });
  // 小節の残りを休符で埋める
  if (measureNotes.length > 0 && currentBeats < MEASURE_BEATS) {
    let beatsRest = MEASURE_BEATS - currentBeats;
    while (beatsRest > 0) {
      const restDur = getBestDur(beatsRest);
      const restBeats = getDurationValue(restDur);
      measureNotes.push(`\n                  <rest dur="${restDur}"/>`);
      beatsRest -= restBeats;
    }
  }
  if (measureNotes.length > 0) {
    allMeasures.push(
      `<measure n="${measureCount}">\n  <staff n="1">\n    <layer n="1">${measureNotes.join("")}\n    </layer>\n  </staff>\n</measure>`
    );
  }

  // MEIテンプレートに小節を挿入
  const meiStart2 = `<?xml version="1.0" encoding="UTF-8"?>\n<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">\n  <meiHead>\n    <fileDesc>\n      <titleStmt>\n        <title>図形譜から生成</title>\n      </titleStmt>\n    </fileDesc>\n  </meiHead>\n  <music>\n    <body>\n      <mdiv>\n        <score>\n          <scoreDef meter.count="4" meter.unit="4" key.sig="0">\n            <staffGrp>\n              <staffDef n="1" clef.shape="G" clef.line="2" lines="5"/>\n            </staffGrp>\n          </scoreDef>\n          <section>`;
  const meiEnd2 = `\n        </section>\n      </score>\n    </mdiv>\n  </body>\n</music>\n</mei>`;

  return meiStart2 + allMeasures.join("") + meiEnd2;
};

// 空のMEIスコアを取得
const getEmptyMEIScore = (): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
};
