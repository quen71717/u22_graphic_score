import { NoteInfo } from "../context/IntegratedScoreContext";

// 音符情報からMEIデータに変換する関数
export const convertNotesToMEI = (notes: NoteInfo[]): string => {
  if (notes.length === 0) {
    return getEmptyMEIScore();
  }

  // MEIテンプレートの作成
  const meiStart = `<?xml version="1.0" encoding="UTF-8"?>
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
                <layer n="1">`;

  const meiEnd = `
                </layer>
              </staff>
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;

  // 音符データの生成
  const noteElements = notes
    .map((note, index) => {
      const { pitch, position } = note;
      const pname = pitch.charAt(0).toLowerCase();
      const oct = pitch.charAt(1);

      // 音符の間隔から音価を推測（簡易版）
      const dur = "4"; // とりあえず4分音符固定

      return `\n                  <note xml:id="n${index}" pname="${pname}" oct="${oct}" dur="${dur}"/>`;
    })
    .join("");

  return meiStart + noteElements + meiEnd;
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
                  <note pname="c" oct="4" dur="4"/>
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
