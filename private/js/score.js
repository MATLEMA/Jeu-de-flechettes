/**
 * Calcule le score depuis la position du curseur et le milieu de la cible
 * @param {Cible} cible 
 * @param {number[]} position 
 * @returns {number[]}
 */
function getScore(milieuCible, cibleRayonMax, position, informationScale) {
    if (milieuCible == -1) {
        return [0, 0, false, "En dehors"];
    }
    let [xa, ya] = position;
    let [xb, yb] = milieuCible;
    let rayonMax = informationScale["scaleDouble"] * cibleRayonMax;
    let rayonDouble = informationScale["scaleSimpleExterieur"] * cibleRayonMax;
    let rayonSimpleExterieur = informationScale["scaleTriple"] * cibleRayonMax;
    let rayonTriple = informationScale["scaleSimpleInterieur"] * cibleRayonMax;
    let rayonSimpleInterieur = informationScale["scaleBullEye"] * cibleRayonMax;
    let rayonBullEye = informationScale["scaleDoubleBullEye"] * cibleRayonMax;
    let decalageDegreCible = 8
    let possibiliteScore = Array(6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5, 20, 1, 18, 4, 13)

    // Calcule des coordonnées polaires
    let distanceEntrePoints = Math.sqrt(Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2));
    let angle = ((Math.atan2((ya - yb), (xa - xb)) * 180 / Math.PI) + decalageDegreCible + 180) % 360;

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

module.exports = getScore;