import { Cible } from './utils/cible.js';
import { Joueur } from './utils/joueur.js';
import { Vibration } from './utils/curseur.js';
import { Partie } from './utils/partie.js';
import { Afficheur } from './utils/afficheur.js';
/**
 * Point d'entrée pour crée une cible
 */
export function main() {

    const objetCible = new Cible("cible");
    const vibration = new Vibration(objetCible);

    const afficheur = new Afficheur("afficheur")
    new Partie(objetCible, vibration, afficheur);
}

// Attend que l'html soit load
document.addEventListener("DOMContentLoaded", main);
