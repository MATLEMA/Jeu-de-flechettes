export class Joueur {
    #pseudo;
    #score;
    constructor(pseudo) {
        this.#pseudo = pseudo;
        this.#score = -1;
    }

    get score() {
        return this.#score;
    }

    set score(score) {
        if (score > 0){
            this.#score = score;
        }
        // Ne fait rien si score à attribuer est inferieur à 0
    }

    get pseudo() {
        return this.#pseudo;
    }

    set pseudo(pseudo) {
        this.#pseudo = pseudo;
    }

    toString() {
        return this.#pseudo;
    }
}