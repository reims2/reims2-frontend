import {
  Glasses,
  Eye,
  GlassesSearch,
  GlassesResult,
  hasAdd,
  PhilscoreReasons,
} from '@/model/GlassesModel'

// glasses with a philscore higher than this will be removed
const PHILSCORE_CUT_OFF = 10
// Glasses with a sphere/cylinder/additional delta of more than this will be removed
const NORMAL_TOLERANCE = 0.5
const HIGH_TOLERANCE = 1.0

export default function calculateAllPhilscore(
  terms: GlassesSearch,
  glasses: Glasses[],
): GlassesResult[] {
  const rxOd = terms.od
  const rxOs = terms.os
  const isSinglefocal = terms.glassesType === 'single'
  const tolerance =
    terms.highTolerance !== null && terms.highTolerance ? HIGH_TOLERANCE : NORMAL_TOLERANCE

  return glasses
    .slice()
    .filter((glass) => terms.glassesType === glass.glassesType)
    .filter((glass) => rxOd.isBAL || checkForSingleAxisTolerance(rxOd, glass.od))
    .filter((glass) => rxOs.isBAL || checkForSingleAxisTolerance(rxOd, glass.os))
    .filter((glass) => rxOd.isBAL || checkForTolerances(glass.od, rxOd, tolerance))
    .filter((glass) => rxOs.isBAL || checkForTolerances(glass.os, rxOs, tolerance))
    .filter((glass) => !rxOd.isBAL || checkForTolerances(glass.od, rxOs, 1.0))
    .filter((glass) => !rxOs.isBAL || checkForTolerances(glass.os, rxOd, 1.0))
    .filter(
      (glass) =>
        isSinglefocal || rxOd.isBAL || checkForAdditionalTolerance(glass.od, rxOd, tolerance),
    )
    .filter(
      (glass) =>
        isSinglefocal || rxOs.isBAL || checkForAdditionalTolerance(glass.os, rxOs, tolerance),
    )
    .map((glass) => {
      const odScoreReasons = calcSingleEyePhilscore(rxOd, glass.od, isSinglefocal)
      const osScoreReasons = calcSingleEyePhilscore(rxOs, glass.os, isSinglefocal)
      const odScore = rxOd.isBAL ? 0 : convertReasonsToScore(odScoreReasons)
      const osScore = rxOs.isBAL ? 0 : convertReasonsToScore(osScoreReasons)

      return { ...glass, score: odScore + osScore, odScoreReasons, osScoreReasons }
    })
    .filter((glass) => glass.score <= PHILSCORE_CUT_OFF)
    .sort((a, b) => (a.score > b.score ? 1 : -1))
}

function convertReasonsToScore(reasons: PhilscoreReasons): number {
  return (
    reasons.sphereScore +
    reasons.cylinderScore +
    reasons.axisScore +
    reasons.addScore +
    reasons.sphericalEquivalent +
    reasons.contraryDiffs +
    reasons.equalSphereAndSmallCylinder +
    reasons.multiFocalAdd +
    reasons.smallerLensSphere
  )
}

function checkForSingleAxisTolerance(rx: Eye, lens: Eye): boolean {
  /* The AtoLTF Test: We filter out all glasses that have a too big axis difference */
  // Some arbitrary numbers from the PDF, in short: Smaller cylinders allow for a greater tolerance.
  const toleranceYValues = [7, 8, 9, 10, 13, 15, 20, 25, 35, 90]
  const toleranceXValues = [-4, -3, -2, -1.75, -1.25, -1, -0.75, -0.5, -0.25, 0]
  // Implement simple "lookup table"
  let selectedTolerance = toleranceYValues[0]
  for (let i = 0; i < toleranceXValues.length; i++) {
    if (lens.cylinder < toleranceXValues[i]) break
    selectedTolerance = toleranceYValues[i]
  }

  // Now calculate the minima and maxima. We have two pairs of min and max because we have to account for "wraparound"
  // An axis of 0 with a tolerance of plus and minus 10, has to be between 170-180 and 0-10, because 180 wraps around to 0.
  // This is all we do here really
  const axisSub = rx.axis - selectedTolerance
  const axisAdd = rx.axis + selectedTolerance

  const minimum1 = axisAdd > 180 || axisSub < 0 ? 0 : axisSub
  const maximum1 = axisAdd > 180 ? axisAdd - 180 : axisAdd

  let minimum2 = axisAdd > 180 || axisSub < 0 ? axisSub : 0
  if (axisSub < 0) minimum2 += 180

  const maximum2 = axisAdd > 180 || axisSub < 0 ? 180 : 0

  // Now return true if the lens axis lays inbetween one of the two min-max pairs
  return (
    (lens.axis >= minimum1 && lens.axis <= maximum1) ||
    (lens.axis >= minimum2 && lens.axis <= maximum2)
  )
}

function checkForTolerances(lens: Eye, rx: Eye, tolerance: number): boolean {
  /**
   * Check if the rx itself or any of its spherical equivalents is in the tolerance range of sphere+cylinder of lens.
   */
  for (const equivalent of calcSphericalEquivalents(rx.sphere, rx.cylinder)) {
    if (
      Math.abs(equivalent.sphere - lens.sphere) <= tolerance &&
      Math.abs(equivalent.cylinder - lens.cylinder) <= tolerance
    )
      return true
  }
  return false
}

function checkForAdditionalTolerance(eye: Eye, rx: Eye, tolerance: number): boolean {
  if (eye.add === undefined || rx.add === undefined) return true
  return Math.abs(eye.add - rx.add) <= tolerance
}

export function calcSingleEyePhilscore(
  rx: Eye,
  lens: Eye,
  isSinglefocal: boolean,
): PhilscoreReasons {
  /**
   * rx: desired values for a single eye
   * lens: single eye of one available glasses
   * glassesType: single or multifocal
   */
  const sphereDiff = Math.abs(lens.sphere - rx.sphere)
  const cylinderDiff = Math.abs(lens.cylinder - rx.cylinder)
  const addDiff = !isSinglefocal && hasAdd(lens) && hasAdd(rx) ? Math.abs(lens.add - rx.add) : 0

  let axisDiff = Math.abs(lens.axis - rx.axis)
  axisDiff = axisDiff > 90 ? 180 - axisDiff : axisDiff // account for wraparound (e.g. 190 is 10 in reality)

  const addDiffWeighted = addDiff * 0.1
  const axisDiffWeighted = axisDiff / 3600

  // The diffs make up our main score, weighting the difference of glass and lens on all parameters
  const reasons = {
    sphereScore: sphereDiff,
    cylinderScore: cylinderDiff,
    axisScore: axisDiffWeighted,
    addScore: addDiffWeighted,
    sphericalEquivalent: 0,
    contraryDiffs: 0,
    equalSphereAndSmallCylinder: 0,
    multiFocalAdd: 0,
    smallerLensSphere: 0,
  } as PhilscoreReasons

  /* In the following the score gets improved (=smaller) or worse (=bigger) based on a few rules to account for some optometry special cases */

  // The next 3 rules are applied mutually exclusive (as soon as one applies, the others are ignored). Why? No one knows
  reasons.sphericalEquivalent = sphericalEquivalentScore(
    rx.sphere,
    lens.sphere,
    rx.cylinder,
    lens.cylinder,
  )
  if (reasons.sphericalEquivalent === 0) {
    reasons.contraryDiffs = contraryDiffsScore(rx.sphere, lens.sphere, rx.cylinder, lens.cylinder)
  }
  if (reasons.sphericalEquivalent === 0 && reasons.contraryDiffs === 0) {
    reasons.equalSphereAndSmallCylinder = equalSphereAndSmallCylinderScore(
      rx.sphere,
      lens.sphere,
      cylinderDiff,
    )
  }

  if (!isSinglefocal && hasAdd(rx) && hasAdd(lens)) {
    reasons.multiFocalAdd = multiFocalAddScore(rx.add, lens.add)
  }
  reasons.smallerLensSphere = smallerLensSphereScore(rx.sphere, lens.sphere)

  return reasons
}

export function smallerLensSphereScore(rxSphere: number, lensSphere: number): number {
  if (rxSphere > lensSphere && rxSphere > 0) {
    // ADDING to the score, so it seems to be bad if that is the case
    return +0.25
  }
  return 0
}

export function equalSphereAndSmallCylinderScore(
  rxSphere: number,
  lensSphere: number,
  cylinderDiff: number,
): number {
  /**
   * If sphere matches and the cylinder difference is small, substract an additonal amount
   * because this makes the glasses near perfect even though they have a difference in cylinder
   */
  if (rxSphere === lensSphere && cylinderDiff !== 0 && cylinderDiff <= 0.75) {
    return -0.12
  }
  return 0
}

export function contraryDiffsScore(
  rxSphere: number,
  lensSphere: number,
  rxCylinder: number,
  lensCylinder: number,
): number {
  /**
   * If either cylinders are too small AND spheres are too big; or the other way round, improve the score by subtracting a bit
   */
  const sphereDiff = Math.abs(lensSphere - rxSphere)
  const cylinderDiff = Math.abs(lensCylinder - rxCylinder)
  if (
    (lensSphere > rxSphere && rxCylinder > lensCylinder) ||
    (lensSphere < rxSphere && rxCylinder < lensCylinder)
  ) {
    // Subtract based on how big the difference is
    if (cylinderDiff < 0.5) {
      // should be the same as cylinderDiff === 0.25 (not 0 though!)
      // Subtract a bit more when sphere and cylinder have exactly the same difference
      return sphereDiff === cylinderDiff ? -0.3 : -0.25
    } else {
      // TODO For some reason, we subtract more when the cylinder difference is higher
      // => maybe so we don't go below zero? in that case it would probably make more sense to make this dynamically in the future
      return sphereDiff === cylinderDiff ? -0.55 : -0.5
    }
  }
  return 0
}

export function sphericalEquivalentScore(
  rxSphere: number,
  lensSphere: number,
  rxCylinder: number,
  lensCylinder: number,
): number {
  /**
   * Account for the fact that one can transform glasses based on sphere+cylinder
   * adding a value to Rx cylinder and subtracting half of that value from the Rx sphere, will give you roughly the same Rx. (but remember cyl > 0 not possible)
   */
  const cylinderDiff = Math.abs(lensCylinder - rxCylinder)
  if (
    rxSphere - lensSphere === (lensCylinder - rxCylinder) / 2 &&
    rxSphere > lensSphere && // this is relevant so the spherical equivalent of lens (other way round) does not return a score?
    cylinderDiff <= 1
  ) {
    return lensSphere > 0 ? -0.55 : -0.5
  }
  return 0
}

function multiFocalAddScore(rxAdd: number, lensAdd: number): number {
  if (lensAdd > rxAdd) {
    return -(lensAdd - rxAdd) / 100
  }
  return 0
}

function calcSphericalEquivalents(
  rxSphere: number,
  rxCylinder: number,
): { sphere: number; cylinder: number }[] {
  /**
   * Calculates all spherical equivalents for provided rxSphere and rxCylinder.
   * Returns those including the original rxSphere+rxCylinder
   */
  const equivalents = [{ sphere: rxSphere, cylinder: rxCylinder }]
  if (rxCylinder <= -0.5) equivalents.push({ sphere: rxSphere - 0.25, cylinder: rxCylinder + 0.5 })
  if (rxCylinder <= -1) equivalents.push({ sphere: rxSphere - 0.5, cylinder: rxCylinder + 1 })
  if (rxCylinder <= -1.5) equivalents.push({ sphere: rxSphere - 0.75, cylinder: rxCylinder + 1.5 })
  return equivalents
}
