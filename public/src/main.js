import { Cible } from './utils/cible.js';
import { Vibration } from './utils/curseur.js';
/**
 * Point d'entrée pour crée une cible
 */
function main() {
    const objetCible = new Cible("cible");
    const vibration = new Vibration(objetCible);

    window.vibration = vibration
    window.objetCible = objetCible
}

// Attend que l'html soit load
document.addEventListener("DOMContentLoaded", main);
