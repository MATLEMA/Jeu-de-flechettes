const Joueur = require("./joueur.js")
const getScore = require("./score.js")

class Partie {
    #typePartie;
    #io
    #utilisateurs
    #joueurs
    #room
    #classement = []
    tourDe

    /**
     * Instancie Partie
     * @param {String} typePartie 
     * @param {Socket} io 
     * @param {Object} utilisateurs 
     * @param {String} room 
     */
    constructor(typePartie, io, utilisateurs, room) {
        this.#io = io
        this.#typePartie = typePartie;
        this.#utilisateurs = utilisateurs
        this.#room = room
        this.#joueurs = []
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
        for (const [uuid, valeur] of Object.entries(this.#utilisateurs)) {
            this.#joueurs.push(new Joueur(uuid, valeur["username"], scoreDebut))
            this.#modifierScore(this.#joueurs.at(-1), scoreDebut)
        }

        var fini = false;
        var nbrTours = 0;
        while (!fini) {
            nbrTours++;
            for (const index in this.#joueurs) {
                if (this.#classement.includes(this.#joueurs[index])) {
                    continue;
                }

                if (this.#classement.length == this.#joueurs.length) {
                    fini = true
                    break
                }

                await this.#volee(this.#joueurs[index])

                if (this.#joueurs[index].score == 0) {
                    this.#updateClassement(this.#joueurs[index])
                }
            }
            var testPartiePerdu = 0 // Si tout les scores sont <= 1 alors partie interminable les personnes à ont fini les personnes à 1 ne gagneront jamais
            for (const index in this.#joueurs) {
                if (this.#joueurs[index].score <= 1) {
                    testPartiePerdu++
                }
            }
            if (testPartiePerdu == this.#joueurs.length) {
                fini = true
                break
            }
        }
        var ordre = ["premier", "deuxieme", "troisieme", "quatrième"]
        for (const joueur in this.#classement) {
            this.#io.in(this.#room).emit("chat message", `${this.#classement[joueur]} à fini ${ordre[joueur]}`)
        }

        let secondes = 10;
        const timer = setInterval(() => {
            secondes -= 1;
            this.#io.in(this.#room).emit("chat message", `Partie terminé! Retour dans ${secondes}s`)

            if (secondes <= 0) {
                clearInterval(timer);
                this.#io.in(this.#room).emit("termine", "/")
            }
        }, 1000);
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
        for (let i = 0; i < 3; i++) {
            try {
                var utilisateur = this.#utilisateurs[joueur.uuid]["socket"]
                var [position, rayonMax, milieuCible, informationScale] = await this.#recevoirPosition(utilisateur);
                var score = getScore(milieuCible, rayonMax, position, informationScale);
                valeursVolee.push(score)
                this.#appliquerScore(joueur, score)
                if (joueur.score == 0) {
                    return
                }
            } catch(err) {
                // utilisateur s'est déconnecté
                break
            }
        }
    }
    /**
     * Permet de recevoir la position du click dans un delai de 30s
     * @returns {number[]}
     */
    async #recevoirPosition(utilisateur) {
        /* Attend un event click sur la cible pendant 30s
        la fonction renvoie la position du click
        si il n'y a eu aucun click pdt 30s alors la position sera négative (incorrecte)
        */
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                utilisateur.removeListener("positionClick", reponse);
                resolve([-1, -1, -1, -1]);
            }, 30000); // 30s

            const reponse = (donnees) => {
                clearTimeout(timeout);
                resolve(donnees);
            };

            utilisateur.once("positionClick", reponse);
            
            utilisateur.emit("tonTour");
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
        this.#io.in(this.#room).emit("score", score, multiplicateur, intitule)
        if (joueur.score - score * multiplicateur < 0) {
            return;
        }
        if (joueur.score - score * multiplicateur == 0 & estDouble == true) {
            joueur.score -= score * multiplicateur
            this.#modifierScore(joueur)
            return;
        }
        if (joueur.score - score * multiplicateur == 0 & estDouble == false) {
            return;
        }

        joueur.score -= score * multiplicateur;
        this.#modifierScore(joueur)
    }

    #updateClassement(joueur){
        this.#classement.push(joueur)
    }

    /**
     * Envoi à la vue des joueurs le tour d'un joueur
     * @param {Joueur} joueur 
     */
    #auTourDe(joueur) {
        this.#io.in(this.#room).emit("tourDe", joueur.pseudo)
    }
    /**
     * Envoi à la vue des joueurs un score à modifier
     */
    #modifierScore(joueur, score) {
        this.#io.in(this.#room).emit("modifier-score", joueur.pseudo, score ?? joueur.score)
    }

    
}

module.exports = Partie;