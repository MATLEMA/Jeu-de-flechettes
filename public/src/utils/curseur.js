export class Vibration {
    vibrationBool = false;
    #centreImage;

    constructor(objetCible) {
        var cible = document.getElementById("cible");
        this.objetCible = objetCible
        this.vibrationBool = false;
        this.chargerImage()
        cible.style.cursor = `url('${this.curseurPrecharge.src}') ${this.#centreImage} ${this.#centreImage}, auto`;

        /* Optimisation permet de ne pas vibrer le curseur si le curseur n'est pas sur la cible */
        /* Attention je pense qu'il y a un bug si nous chargeons la page avec le curseur sur la cible cela ne trigger pas mousenter et donc ne vibre pas */
        cible.addEventListener("mouseenter", () => this.lancerVibration());
        cible.addEventListener("mouseleave", () => this.eteindreVibration());
    }

    async chargerImage(){
        new Promise(resolve => {
        /* permet de précharger l'image du curseur afin de ne le charger qu'une fois au lieu de à chaque fois pour chaque iteration */
        /* https://stackoverflow.com/a/10726310 */
        this.curseurPrecharge = new Image();
        this.curseurPrecharge.src = '/assets/img/curseur.png';
        this.curseurPrecharge.onload = () => {
            this.#centreImage = this.curseurPrecharge.width / 2;
            resolve();
            };
        })
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /* Vibration */
    changerDecalageSouris(rayonMax) {
        // L'image du curseur est carré!!
        var decalageX = Math.random();
        var decalageY = Math.random();

        if (decalageX < 0.5) {
            decalageX = decalageX * -1;
        };

        if (decalageY < 0.5) {
            decalageY = decalageY * -1;
        };

        this.decalageX = decalageX * (rayonMax * 0)
        this.decalageY = decalageY * (rayonMax * 0)
        decalageX = this.#centreImage + decalageX * (rayonMax * 0);
        decalageY = this.#centreImage + decalageY * (rayonMax * 0);

        cible.style.cursor = `url('${this.curseurPrecharge.src}') ${decalageX} ${decalageY}, auto`;
    }

    lancerVibration() {
        this.vibrationBool = true;
        this.faireVibration();
    }

    eteindreVibration() {
        this.vibrationBool = false;
    };

    async faireVibration() {
        while (this.vibrationBool) {
            this.changerDecalageSouris(this.objetCible.rayonMax);
            await this.sleep(250);
        };
    }
}