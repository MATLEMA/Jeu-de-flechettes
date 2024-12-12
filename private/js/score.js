/**
 * Calcule le score depuis la position du curseur et le milieu de la cible
 * @param {Cible} cible 
 * @param {number[]} position 
 * @returns {number[]}
 */
export function getScore(cible, position) {
    let [xa, ya] = position;
    let [xb, yb] = cible.milieuCible;
    let rayonMax = cible.scaleDouble * cible.rayonMax;
    let rayonDouble = cible.scaleSimpleExterieur * cible.rayonMax;
    let rayonSimpleExterieur = cible.scaleTriple * cible.rayonMax;
    let rayonTriple = cible.scaleSimpleInterieur * cible.rayonMax;
    let rayonSimpleInterieur = cible.scaleBullEye * cible.rayonMax;
    let rayonBullEye = cible.scaleDoubleBullEye * cible.rayonMax;
    let decalageDegreCible = cible.decalageDegreCible;
    let possibiliteScore = cible.score;

    // Calcule des coordonnées polaires
    let distanceEntrePoints = Math.sqrt(Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2));
    let angle = ((Math.atan2((ya - yb), (xa - xb)) * 180 / Math.PI) + decalageDegreCible + 360) % 360;

    if (distanceEntrePoints < rayonBullEye) {
        return [25, 2, true, "DoubleBulleye"];
    }

    if (distanceEntrePoints < rayonSimpleInterieur) {
        return [25, 1, false, "Bulleye"];
    }

    let indexScore = Math.floor(angle / (360 / possibiliteScore.length));
    let score = possibiliteScore[indexScore];

    if (distanceEntrePoints < rayonTriple) {
        return [score, 1, false, "Simple"]; //  Interieur
    }

    if (distanceEntrePoints < rayonSimpleExterieur) {
        return [score, 3, false, "Triple"];
    }

    if (distanceEntrePoints < rayonDouble) {
        return [score, 1, false, "Simple"]; //  Exterieur
    }

    if (distanceEntrePoints < rayonMax) {
        return [score, 2, true, "Double"];
    }

    return [0, 0, false, "En dehors"];
}
