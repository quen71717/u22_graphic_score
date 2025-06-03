import Note from "./note.js";
export default class Layer {

    #notes;
    constructor(notes) {

        this.#notes = notes;
    }
}