import { NoteInfo } from "../context/IntegratedScoreContext";

// 音符情報からMEIデータに変換する関数
export const convertNotesToMEI = (notes: NoteInfo[]): string => {
  if (notes.length === 0) {
    return getEmptyMEIScore();
  }

  // 拍数計算用のヘルパー
  const getDurationValue = (dur: string) => {
    // dur: "1"=全音符=4拍, "2"=2分=2拍, "4"=4分=1拍, "8"=8分=0.5拍, "16"=16分=0.25拍
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

  // 小節ごとに分割してMEIを生成
  const MEASURE_BEATS = 4; // 4/4拍子
  let measureCount = 1;
  let currentBeats = 0;
  let measureNotes: string[] = [];
  let allMeasures: string[] = [];

  notes.forEach((note, index) => {
    const { pitch, duration } = note as any;
    const pname = pitch.charAt(0).toLowerCase();
    const oct = pitch.charAt(1);
    const dur = duration || "8";
    const noteXml = `\n                  <note xml:id="n${index}" pname="${pname}" oct="${oct}" dur="${dur}"/>`;
    const beatVal = getDurationValue(dur);
    if (currentBeats + beatVal > MEASURE_BEATS && measureNotes.length > 0) {
      // 小節を閉じる
      allMeasures.push(
        `<measure n="${measureCount}">\n  <staff n="1">\n    <layer n="1">${measureNotes.join(
          ""
        )}\n    </layer>\n  </staff>\n</measure>`
      );
      measureCount++;
      measureNotes = [];
      currentBeats = 0;
    }
    measureNotes.push(noteXml);
    currentBeats += beatVal;
  });
  // 最後の小節
  if (measureNotes.length > 0) {
    allMeasures.push(
      `<measure n="${measureCount}">\n  <staff n="1">\n    <layer n="1">${measureNotes.join(
        ""
      )}\n    </layer>\n  </staff>\n</measure>`
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
