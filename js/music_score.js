import MusicMeasure from "./music_measure.js";
import Staff from "./staff.js";
import Layer from "./layer.js";
import Note from "./note.js";

class MusicScore {

    #title;

    // 拍子の分子
    #meterCount;
    // 拍子の分母
    #meterUnit;

    // ト音(G)かヘ音(F)かハ音(C)
    #clefShape;

    // 小説数
    #mesures;
    
    // #pname;
    // #oct;
    #dur

    constructor(measures) {

        this.#title = "New Score"

        this.#meterCount = 4;
        this.#meterUnit = 4;

        this.#clefShape = "G";

        this.#mesures = measures;

        
        
    }
}

const musicscore = new MusicScore(
    [new Staff(
        [new Layer(
            new Note(4, "c", 4, "")
        )]
    )]
);

console.log(musicscore);