export class Joueur {
    #pseudo;
    #score;
    #uuid;
    constructor(uuid, pseudo, score) {
        this.#uuid = uuid
        this.#pseudo = pseudo;
        this.#score = score;
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

    get uuid() {
        return this.#uuid;
    }

    set uuid(uuid) {
        this.#uuid = uuid;
    }

    toString() {
        return this.#pseudo;
    }
}