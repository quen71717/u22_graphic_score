export default class Note {

    // 長さ
    #dur;

    // 音の種類
    #pname;

    // 高さ
    #oct;

    // 臨時記号？
    #accid;

    constructor(dur, pname, oct, accid) {

        this.#dur = dur;

        this.#pname = pname;

        this.#oct = oct;

        this.#accid = accid;

    };
};