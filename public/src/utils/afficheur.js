export class Afficheur{
    #svg;
    #ns = "http://www.w3.org/2000/svg";
    #milieu;
    constructor(DOMElement){
        this.#svg = document.getElementById(DOMElement);
        this.#calculerMilieuCanva();
    }

    /**
     * Calcule le milieu du conteneur parent et le met dans l'attribut milieu
     */
    #calculerMilieuCanva() {
        this.#milieu = Array(this.#svg.clientWidth / 2, this.#svg.clientHeight / 2);
    };

    /**
     * Retourne le milieu de la cible
     */
    get milieuCible() {
        return this.#milieu;
    };

    auTourDe(joueur){
        var nomJoueur = joueur.pseudo
        var texteTourDe = document.getElementById("tour")
        if (texteTourDe){
            texteTourDe.childNodes[0].nodeValue = `Au tour de ${nomJoueur}`;
       } else {
            var texteTourDe = document.createElementNS(this.#ns, 'text');
            texteTourDe.setAttributeNS(null, "x", this.#milieu[0]);
            texteTourDe.setAttributeNS(null, "y", this.#milieu[1] - 15);
            var textNode = document.createTextNode(`Au tour de ${nomJoueur}`);
            texteTourDe.appendChild(textNode);
            texteTourDe.setAttribute("dominant-baseline", "middle");
            texteTourDe.setAttribute("text-anchor", "middle");
            texteTourDe.setAttribute("startOffset", "50%");
            texteTourDe.setAttribute("id", "tour");
            this.#svg.appendChild(texteTourDe);
        }
    }

    score(score, multiplicateur, intitule){
        var scoreElement = document.getElementById("score");
        if (scoreElement){
            scoreElement.childNodes[0].nodeValue = `Score: ${score * multiplicateur}`;
      } else {
            var scoreElement = document.createElementNS(this.#ns, 'text');
            scoreElement.setAttributeNS(null, "x", this.#milieu[0]);
            scoreElement.setAttributeNS(null, "y", this.#milieu[1]);
            var textNode = document.createTextNode(`Score: ${score * multiplicateur}`);
            scoreElement.appendChild(textNode);
            scoreElement.setAttribute("dominant-baseline", "middle");
            scoreElement.setAttribute("text-anchor", "middle");
            scoreElement.setAttribute("startOffset", "50%");
            scoreElement.setAttribute("id", "score");
            this.#svg.appendChild(scoreElement);
        }
        var intituleScore = document.getElementById("inituleScore");
        if (intituleScore){
            intituleScore.childNodes[0].nodeValue = `${intitule} ${score}`;
        } else {
            var intituleScore = document.createElementNS(this.#ns, 'text');
            intituleScore.setAttributeNS(null, "x", this.#milieu[0]);
            intituleScore.setAttributeNS(null, "y", this.#milieu[1] + 15);
            var textNode = document.createTextNode(`${intitule} ${score}`);
            intituleScore.appendChild(textNode);
            intituleScore.setAttribute("dominant-baseline", "middle");
            intituleScore.setAttribute("text-anchor", "middle");
            intituleScore.setAttribute("startOffset", "50%");
            intituleScore.setAttribute("id", "inituleScore");
            this.#svg.appendChild(intituleScore);
        }
    }
    scoresTotal(joueurs){
        var position = 15
        for (const index in joueurs) {
            var scoreTotal = document.getElementById(`scoreTotal ${joueurs[index].pseudo}`);
            if (scoreTotal){
                scoreTotal.childNodes[0].nodeValue = `${joueurs[index].pseudo}: ${joueurs[index].score}`;
            } else {
                var scoreTotal = document.createElementNS(this.#ns, 'text');
                scoreTotal.setAttributeNS(null, "x", 50);
                scoreTotal.setAttributeNS(null, "y", position);
                var textNode = document.createTextNode(`${joueurs[index].pseudo}: ${joueurs[index].score}`);
                scoreTotal.appendChild(textNode);
                scoreTotal.setAttribute("dominant-baseline", "middle");
                scoreTotal.setAttribute("text-anchor", "middle");
                scoreTotal.setAttribute("startOffset", "50%");
                scoreTotal.setAttribute("id", `scoreTotal ${joueurs[index].pseudo}`);
                this.#svg.appendChild(scoreTotal);
            }
            position += 15
        }
    }
    gagner(joueur){
        document.getElementById("score").remove()
        document.getElementById("tour").remove()
        document.getElementById("inituleScore").remove()
        var gagner = document.createElementNS(this.#ns, 'text');
        gagner.setAttributeNS(null, "x", this.#milieu[0]);
        gagner.setAttributeNS(null, "y", this.#milieu[1]);
        var textNode = document.createTextNode(`Gagnant: ${joueur}`);
        gagner.appendChild(textNode);
        gagner.setAttribute("dominant-baseline", "middle");
        gagner.setAttribute("text-anchor", "middle");
        gagner.setAttribute("startOffset", "50%");
        gagner.setAttribute("id", `gagnant`);
        this.#svg.appendChild(gagner);
    }
}
