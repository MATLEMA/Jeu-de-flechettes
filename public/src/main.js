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
    new Vibration(objetCible);
}

// Attend que l'html soit load
document.addEventListener("DOMContentLoaded", main);
