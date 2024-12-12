import { Cible } from './utils/cible.js';
import { Vibration } from './utils/curseur.js';
/**
 * Point d'entrée pour crée une cible
 */
export function main() {

    const objetCible = new Cible("cible");
    new Vibration(objetCible);
}

// Attend que l'html soit load
document.addEventListener("DOMContentLoaded", main);
