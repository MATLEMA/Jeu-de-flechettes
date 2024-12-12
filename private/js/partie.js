import { Joueur } from "./joueur.js";
import { getScore } from "./score.js";

export class Partie {
    #typePartie;
    #io
    #listeJoueurs
    #joueurs
    #room
    constructor(typePartie, io, listeJoueurs, room) {
        this.#io = io
        this.#typePartie = typePartie;
        this.#listeJoueurs = listeJoueurs
        this.#room = room
        this.#lancerPartie()
    };

    /**
     * Choisi le type de partie à lancer
     * @param {Array} joueurs 
     * @param {string} typePartie 
     */
    #lancerPartie(){
        switch (this.#typePartie){
            case "cricket":
                //this.#lancerPartieCricket()
                // break
            case "501":
                this.#lancerPartieX01(501)
                break
            case "701":
                this.#lancerPartieX01(701)
                break
            case "901":
                this.#lancerPartieX01(901)
                break
            default:
                this.#lancerPartieX01(301)
        }
    }

    /**
    * Lance une partie de X01
    * @param {Array} joueurs Tous les joueurs
    * @param {number} scoreDebut Type de partie
    */
    async #lancerPartieX01(scoreDebut) {

        // Instanciation des joueurs
        for (const [uuid, username] of Object.entries(this.#listeJoueurs)) {
            this.#joueurs.push(Joueur(uuid, username, scoreDebut))
        }

        var fini = false;
        var nbrTours = 0;
        while (!fini) {
            nbrTours++;
            for (const index in this.#joueurs) {
                var fini = await this.#volee(this.#joueurs[index])
                if (fini == true){
                    break
                }
            }
        }
    }


    /**
     * Une fonction permettant de gérer la volée d'un joueur
     * Elle appelle les affichages des tours
     * Elle recoit la position puis traite le score associé
     * 
     * @param {Array} joueurs 
     * @param {Joueur} joueur 
     * @returns 
     */
    async #volee(joueur){
        var valeursVolee = Array()
        this.#auTourDe(joueur)
        // for (let i = 0; i < 3; i++) {
        //     this.#scoresTotal(this.#joueurs)
        //     var position = await this.#recevoirPosition();
        //     var score = getScore(this.#cible, position);
        //     valeursVolee.push(score)

        //     this.#appliquerScore(joueur, score)

        //     this.#updateClassement()

        // }
    }

    // async #lancerPartieCricket(){
    //     var scoreAutorisee = Array(15, 16, 17, 18, 19, 20, 25, 50)
    // }

    /**
     * Permet de recevoir la position du click dans un delai de 30s
     * @returns {number[]}
     */
    // #recevoirPosition() {
    //     /* Attend un event click sur la cible pendant 30s
    //     la fonction renvoie la position du click
    //     si il n'y a eu aucun click pdt 30s alors la position sera négative (incorrecte)
    //     */
    //     return new Promise((resolve) => {

    //         const finAttenteReponse = () => {
    //             clearTimeout(timer);
    //             resolve([-1, -1]);
    //         };

    //         const reponse = (event) => {
    //             this.#cible.canvas.removeEventListener("click", reponse);
    //             clearTimeout(timer);
    //             resolve([event.offsetX - this.#vibration.decalageX, event.offsetY - this.#vibration.decalageY]);
    //         };
    //         var timer = setTimeout(finAttenteReponse, 30000); // 30s
    //         this.#cible.canvas.addEventListener("click", reponse, { once: true });
    //     })
    // }


    /**
     * Applique le score reçu avec le score du joueur si possible
     * @param {Joueur} joueur 
     * @param {number[]} score 
     */
    // #appliquerScore(joueur, score) {
    //     // Il n'est pas possible de gagner un match si l'on arrive à 1
    //     var [score, multiplicateur, estDouble, intitule] = score;
    //     this.#afficheur.score(score, multiplicateur, intitule)
    //     if (joueur.score - score * multiplicateur < 0) {
    //         return;
    //     }
    //     if (joueur.score - score * multiplicateur == 0 & estDouble == true) {
    //         joueur.score -= score * multiplicateur
    //         return;
    //     }
    //     if (joueur.score - score * multiplicateur == 0 & estDouble == false) {
    //         return;
    //     }

    //     joueur.score -= score * multiplicateur;
    // }

    // #updateClassement(joueurActuelle){
    //     this.#classementJoueurs = this.#joueurs.slice()
    //     this.#classementJoueurs.sort((joueur1, joueur2) => joueur1.score - joueur2.score);
    // }

    /**
     * Envoi à la vue des joueurs le tour d'un joueur
     * @param {Joueur} joueur 
     */
    #auTourDe(joueur) {
        this.#io.in(this.#room).emit("tourDe", joueur.pseudo)
    }
    /**
     * Envoi à la vue des joueurs tout les scores
     */
    #scoresTotal() {

    }
}