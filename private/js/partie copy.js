import { Joueur } from "./joueur.js";
import { getScore } from "./score.js";
import { Afficheur } from "./afficheur.js";
import { Cible } from "./cible.js";
import { Vibration } from "./curseur.js";

export class Partie {
    #cible;
    #vibration;
    #afficheur;
    #joueurs = Array();
    #classementJoueurs = Array()
    /**
     * Constructeur d'une partie
     * @param {Cible} objetCible 
     * @param {Vibration} vibration 
     * @param {Array} joueurs 
     * @param {Afficheur} afficheur 
     */
    constructor(objetCible, vibration, afficheur) {
        this.#vibration = vibration
        this.#cible = objetCible;
        this.#afficheur = afficheur;
        this.#creationJoueurs();
        this.#attendreChoixPartie();
    };

    #creationJoueurs(){
        var joueur1 = document.getElementById("joueur1")
        var joueur2 = document.getElementById("joueur2")
        var joueur3 = document.getElementById("joueur3")
        var joueur4 = document.getElementById("joueur4")
        var popupJoueurs = document.getElementById("popup-demande-joueurs")
        var popupPartie = document.getElementById("popup-demande-partie")
        var buttonValidation = document.getElementById("validation-joueurs")
        // popupJoueurs.style.visibility = "visible"

        // buttonValidation.addEventListener("click", () => {
        //     popupJoueurs.style.visibility = "hidden"
        //     popupPartie.style.visibility = "visible"
        //     buttonValidation.removeEventListener("click", () => {})
        //     ajouterJoueurs()
        // }, { once: true });
        this.#joueurs.push(new Joueur("hello"))
        const ajouterJoueurs = () => {
            if (joueur1.value != ""){
                this.#joueurs.push(new Joueur(joueur1.value))
            }
            if (joueur2.value != ""){
                this.#joueurs.push(new Joueur(joueur2.value))
            }
            if (joueur3.value != ""){
                this.#joueurs.push(new Joueur(joueur3.value))
            }
            if (joueur4.value != ""){
                this.#joueurs.push(new Joueur(joueur4.value))
            }
            if (this.#joueurs.length == 0){
                this.#creationJoueurs()
            }
        }
    }

    #attendreChoixPartie(){
        var troisCentUn = document.getElementById("301")
        var cinqCentUn = document.getElementById("501");
        var septCentUn = document.getElementById("701");
        var neufCentUn = document.getElementById("901");
        var cricket = document.getElementById("cricket");
        var popup = document.getElementById("popup-demande-partie")
        var cibleBlur = document.getElementById("cible")
        
        this.#lancerPartie("301");
        return
        troisCentUn.addEventListener("click", () => {
            nettoyageListener();
            this.#lancerPartie("301");
        }, { once: true });

        cinqCentUn.addEventListener("click", () => {
            nettoyageListener();
            this.#lancerPartie("501");
        }, { once: true });

        septCentUn.addEventListener("click", () => {
            nettoyageListener();
            this.#lancerPartie("701");
        },{ once: true });
        
        neufCentUn.addEventListener("click", () => {
            nettoyageListener();
            this.#lancerPartie("901");
        }, { once: true });

        cricket.addEventListener("click", () => {
            nettoyageListener();
            this.#lancerPartie("cricket");
        }, { once: true });

        function nettoyageListener(){
            popup.style.visibility = "hidden"
            cibleBlur.style.filter = "none"
            troisCentUn.removeEventListener("click", () => {});
            cinqCentUn.removeEventListener("click", () => {});
            septCentUn.removeEventListener("click", () => {});
            neufCentUn.removeEventListener("click", () => {});
            cricket.removeEventListener("click", () => {});
        }
    }

    /**
     * Permet de recevoir la position du click dans un delai de 30s
     * @returns {number[]}
     */
    #recevoirPosition() {
        /* Attend un event click sur la cible pendant 30s
        la fonction renvoie la position du click
        si il n'y a eu aucun click pdt 30s alors la position sera négative (incorrecte)
        */
        return new Promise((resolve) => {

            const finAttenteReponse = () => {
                clearTimeout(timer);
                resolve([-1, -1]);
            };

            const reponse = (event) => {
                this.#cible.canvas.removeEventListener("click", reponse);
                clearTimeout(timer);
                resolve([event.offsetX - this.#vibration.decalageX, event.offsetY - this.#vibration.decalageY]);
            };
            var timer = setTimeout(finAttenteReponse, 30000); // 30s
            this.#cible.canvas.addEventListener("click", reponse, { once: true });
        })
    }


    /**
     * Applique le score reçu avec le score du joueur si possible
     * @param {Joueur} joueur 
     * @param {number[]} score 
     */
    #appliquerScore(joueur, score) {
        // Il n'est pas possible de gagner un match si l'on arrive à 1
        var [score, multiplicateur, estDouble, intitule] = score;
        this.#afficheur.score(score, multiplicateur, intitule)
        if (joueur.score - score * multiplicateur < 0) {
            return;
        }
        if (joueur.score - score * multiplicateur == 0 & estDouble == true) {
            joueur.score -= score * multiplicateur
            return;
        }
        if (joueur.score - score * multiplicateur == 0 & estDouble == false) {
            return;
        }

        joueur.score -= score * multiplicateur;
    }

    #updateClassement(joueurActuelle){
        this.#classementJoueurs = this.#joueurs.slice()
        this.#classementJoueurs.sort((joueur1, joueur2) => joueur1.score - joueur2.score);
    }

    /**
     * Choisi le type de partie à lancer
     * @param {Array} joueurs 
     * @param {string} typePartie 
     */
    #lancerPartie(typePartie){
        switch (typePartie){
            case "cricket":
                this.#lancerPartieCricket()
                break
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
        this.#afficheur.auTourDe(joueur)
        for (let i = 0; i < 3; i++) {
            this.#afficheur.scoresTotal(this.#joueurs)
            var position = await this.#recevoirPosition();
            var score = getScore(this.#cible, position);
            valeursVolee.push(score)

            this.#appliquerScore(joueur, score)

            this.#updateClassement()

        }
    }
    /**
     * Lance une partie de X01
     * @param {Array} joueurs Tous les joueurs
     * @param {number} scoreDebut Type de partie
     */
    async #lancerPartieX01(scoreDebut) {
        for (let i = 0; i < this.#joueurs.length; i++) {
            this.#joueurs[i].score = scoreDebut;
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
    async #lancerPartieCricket(){
        var scoreAutorisee = Array(15, 16, 17, 18, 19, 20, 25, 50)
    }
}