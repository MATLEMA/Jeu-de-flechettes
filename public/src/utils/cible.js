export class Cible {

    #informationsZone = {};
    #contourWidth = 0;

    #timer = 0;
    #delayEnMs = 50;
    #rayonMax = 0;
    #milieu = Array(0, 0);

    #nombresSecteur = Array(6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5, 20, 1, 18, 4, 13)
    #ns = "http://www.w3.org/2000/svg";
    #skin
    /**
     * Correspond à la cible
     * @param {string} nom_canvas 
     */
    constructor(nom_canvas) {
        this.canvas = document.getElementById(nom_canvas);

        this.#skin = "rouge"
        this.canvas.addEventListener("resize", (event) => {
            console.log(event)
        })
        this.#dessiner()
        /* Permet de réduire les appels de la fonction dessiner qui redessine à chaque fois..*/
        new ResizeObserver(() => {
            clearTimeout(this.#timer);
            this.#timer = setTimeout(() => this.#dessiner(), this.#delayEnMs);
        }).observe(this.canvas);

    };

    /**
     * Calcule le milieu du conteneur parent et le met dans l'attribut milieu
     */
    #calculerMilieuCanva() {
        this.#milieu = Array(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2);
    };

    /**
     * Calcule le rayon max d'un cercle dans le conteneur parent et le met dans l'attribut rayonMax
     */
    #calculerRayonMax() {
        this.#rayonMax = Math.min(this.canvas.clientWidth, this.canvas.clientHeight) / 2 - 20;
    };

    /**
     * Retourne le rayon max
     */
    get rayonMax() {
        return this.#rayonMax;
    };

    /**
     * Retourne le milieu de la cible
     */
    get milieuCible() {
        return this.#milieu;
    };

    get score() {
        return this.#nombresSecteur
    }


    /**
     * Dessine la cible
     * @param {string} couleurCible 
     */
    #dessiner() {
        var couleurCible = this.#skin
        this.canvas.textContent = "";
        this.#calculerMilieuCanva();
        this.#calculerRayonMax();

        var couleurBord, couleurDouble, couleurSimpleExterieur, couleurTriple, couleurSimpleInterieur, couleurBullEye, couleurDoubleBullEye, couleurContour, couleurExterieur, couleurContourBord

        switch (couleurCible) {
            case "bleu":
                /* couleur cible version bleu */
                couleurBord = Array("black", "black");
                couleurDouble = Array("red", "white");
                couleurSimpleExterieur = Array("white", "#04B1EE");
                couleurTriple = Array("red", "white");
                couleurSimpleInterieur = Array("white", "#04B1EE");
                couleurBullEye = "#04B1EE";
                couleurDoubleBullEye = "red";
                couleurContour = "black";
                couleurExterieur = "white";
                couleurContourBord = "black";
                break
            default:
                /* couleur cible version verte*/
                couleurBord = Array("black", "black");
                couleurDouble = Array("#008000", "red");
                couleurSimpleExterieur = Array("white", "black");
                couleurTriple = Array("#008000", "red");
                couleurSimpleInterieur = Array("white", "black");
                couleurBullEye = "#008000";
                couleurDoubleBullEye = "red";
                couleurContour = "DarkGoldenRod";
                couleurExterieur = "white";
                couleurContourBord = "black";
        };

        /* épaisseur contour */
        var contourWidth = 1;
        this.#contourWidth = contourWidth * this.rayonMax * 0.007;


        /* quotient multiplicateur par rapport au rayon max*/
        this.scaleBordExterieur = 1;
        this.scaleBordNombre = 0.98;
        this.scaleDouble = 0.84;
        this.scaleSimpleExterieur = 0.80;
        this.scaleTriple = 0.46;
        this.scaleSimpleInterieur = 0.42;
        this.scaleBullEye = 0.07;
        this.scaleDoubleBullEye = 0.03;

        this.#informationsZone = {
            "Bord": { "scaleExterieur": this.scaleBordNombre, "scaleInterieur": this.scaleDouble, "couleur": couleurBord, "couleurContour": couleurContourBord },
            "Double": { "scaleExterieur": this.scaleDouble, "scaleInterieur": this.scaleSimpleExterieur, "couleur": couleurDouble, "couleurContour": couleurContour },
            "SimpleExterieur": { "scaleExterieur": this.scaleSimpleExterieur, "scaleInterieur": this.scaleTriple, "couleur": couleurSimpleExterieur, "couleurContour": couleurContour },
            "Triple": { "scaleExterieur": this.scaleTriple, "scaleInterieur": this.scaleSimpleInterieur, "couleur": couleurTriple, "couleurContour": couleurContour },
            "SimpleInterieur": { "scaleExterieur": this.scaleSimpleInterieur, "scaleInterieur": this.scaleBullEye, "couleur": couleurSimpleInterieur, "couleurContour": couleurContour },
        };

        /* Cercle exterieur */
        var id = `Exterieur`
        this.#dessinerCercle(this.#milieu[0], this.#milieu[1], this.scaleBordExterieur, couleurExterieur, couleurContourBord, 2, id);

        /* cible */
        this.#creerCible(this.#milieu[0], this.#milieu[1]);

        /* Cercle bulleye */
        var id = `Bulleye`
        this.#dessinerCercle(this.#milieu[0], this.#milieu[1], this.scaleBullEye, couleurBullEye, couleurContourBord, 1, id);

        /* Cercle double bulleye */
        var id = `DoubleBulleye`
        this.#dessinerCercle(this.#milieu[0], this.#milieu[1], this.scaleDoubleBullEye, couleurDoubleBullEye, couleurContourBord, 1, id);

    };

    /**
     * Dessine un cercle centré sur cx et cy dans le conteneur parent
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} scale 
     * @param {string} couleur 
     * @param {string} couleurContour 
     * @param {number} multiplicateurStrokeWidth 
     */
    #dessinerCercle(cx, cy, scale, couleur, couleurContour, multiplicateurStrokeWidth, id) {
        var cercle = document.createElementNS(this.#ns, 'circle');
        cercle.setAttributeNS(null, "cx", cx);
        cercle.setAttributeNS(null, "cy", cy);
        cercle.setAttributeNS(null, "r", this.rayonMax * scale);
        cercle.setAttribute("id", id);
        cercle.setAttribute("fill", couleur);
        cercle.setAttribute("stroke", couleurContour);
        cercle.setAttribute("stroke-width", this.#contourWidth * multiplicateurStrokeWidth);
        this.canvas.appendChild(cercle);
    };

    /**
     * Lancer la boucle de création de dessin de secteurs
     * @param {number} cx 
     * @param {number} cy 
     */
    #creerCible(cx, cy) {
        this.decalageDegreCible = 8;
        for (let angle = 0 - this.decalageDegreCible, i = 0; angle < 342; angle += 18, i++) {
            this.#creerSecteur(cx, cy, angle, angle + 18, i % 2, i);
        };
    };

    /**
     * Permet de crée un secteur
     * Lance la boucle de création de demi couronne
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} angleEnDegreDebut 
     * @param {number} angleEnDegreFin 
     * @param {boolean} alterne 
     * @param {number} compteur 
     */
    #creerSecteur(cx, cy, angleEnDegreDebut, angleEnDegreFin, alterne, compteur) {
        var nombre, id;
        for (const [cle, info] of Object.entries(this.#informationsZone)) {
            nombre = this.#nombresSecteur[compteur];
            this.#dessinerDemiCouronne(cx, cy, angleEnDegreDebut, angleEnDegreFin, info["scaleExterieur"], info["scaleInterieur"], info["couleur"][alterne], info["couleurContour"], cle, nombre);
            if (cle == "Bord") {
                id = "score" + nombre;
                this.#dessinerNombreSecteur(cx, cy, angleEnDegreDebut, angleEnDegreFin, info["scaleExterieur"], info["scaleInterieur"], info["couleur"][alterne], id, nombre);
            };
        };
    };

    /**
     * Dessine une demi couronne centré sur cx et cy ayant pour debut angleEnDegreDebut et comme fin angleEnDegreFin
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} angleEnDegreDebut 
     * @param {number} angleEnDegreFin 
     * @param {number} scaleContourExterieur 
     * @param {number} scaleContourInterieur 
     * @param {string} couleur 
     * @param {string} couleurContour 
     */
    #dessinerDemiCouronne(cx, cy, angleEnDegreDebut, angleEnDegreFin, scaleContourExterieur, scaleContourInterieur, couleur, couleurContour, cle, nombre) {
        var zone = document.createElementNS(this.#ns, "path");
        const rayonContourExterieur = this.rayonMax * scaleContourExterieur;
        const rayonContourInterieur = this.rayonMax * scaleContourInterieur;

        zone.setAttributeNS(null, "d",
            ` M ${this.#calculerPoint(cx, cy, rayonContourInterieur, angleEnDegreDebut)}
              L ${this.#calculerPoint(cx, cy, rayonContourExterieur, angleEnDegreDebut)}
              A ${rayonContourExterieur} ${rayonContourExterieur} 0 0 1 ${this.#calculerPoint(cx, cy, rayonContourExterieur, angleEnDegreFin)}
              L ${this.#calculerPoint(cx, cy, rayonContourInterieur, angleEnDegreFin)}
              A ${rayonContourInterieur} ${rayonContourInterieur} 0 0 0 ${this.#calculerPoint(cx, cy, rayonContourInterieur, angleEnDegreDebut)}
             `);
        zone.setAttribute("id", `${cle} ${nombre}`)
        zone.setAttribute("fill", couleur);
        zone.setAttribute("stroke", couleurContour);
        zone.setAttribute("stroke-width", this.#contourWidth);

        this.canvas.appendChild(zone);
    };

    /**
     * Permet de dessiner le nombre du secteur
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} angleEnDegreDebut 
     * @param {number} angleEnDegreFin 
     * @param {number} scaleContourExterieur 
     * @param {number} scaleContourInterieur 
     * @param {string} couleur 
     * @param {string} id 
     * @param {number} nombre 
     */
    #dessinerNombreSecteur(cx, cy, angleEnDegreDebut, angleEnDegreFin, scaleContourExterieur, scaleContourInterieur, couleur, id, nombre) {
        var arcTexte = document.createElementNS(this.#ns, "path");
        const rayonContour = this.rayonMax * (scaleContourExterieur + scaleContourInterieur) / 2.01;

        const angle = (angleEnDegreDebut + angleEnDegreFin) / 2;
        angleEnDegreDebut = angle - 3;
        angleEnDegreFin = angle + 3;

        arcTexte.setAttributeNS(null, "d",
            ` M ${this.#calculerPoint(cx, cy, rayonContour, angleEnDegreDebut)}
              A ${rayonContour} ${rayonContour} 0 0 1 ${this.#calculerPoint(cx, cy, rayonContour, angleEnDegreFin)}
             `);
        arcTexte.setAttribute("id", id);
        arcTexte.setAttribute("fill", couleur);
        this.canvas.appendChild(arcTexte);

        var text = document.createElementNS(this.#ns, "text");
        var nombreSecteur = document.createElementNS(this.#ns, "textPath")
        nombreSecteur.setAttribute("href", "#" + id);
        nombreSecteur.setAttribute("fill", "white");
        nombreSecteur.setAttribute("dominant-baseline", "middle");
        nombreSecteur.setAttribute("text-anchor", "middle");
        nombreSecteur.setAttribute("startOffset", "50%");
        nombreSecteur.textContent = nombre;

        text.appendChild(nombreSecteur);
        const taillePolice = 15;
        text.setAttribute("font-size", taillePolice * this.rayonMax * 0.009);
        this.canvas.appendChild(text);
    };

    /**
     * Calcule des coordonnées polaire (degrées, rayon depuis un centre)
     * En coordonnées cartésiennes (x, y)
     * @param {number} cx 
     * @param {number} cy 
     * @param {number} rayon 
     * @param {number} angleEnDegre 
     * @return {number[]}
     */
    #calculerPoint(cx, cy, rayon, angleEnDegre) {
        var angleEnRad = angleEnDegre * Math.PI / 180.0;
        var x = Math.cos(angleEnRad) * rayon + cx;
        var y = Math.sin(angleEnRad) * rayon + cy;
        return [x, y];
    };
}