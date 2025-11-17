import { BASE_START_YEAR } from "../constants/CurveBounds";
import type { GompertzCoeff } from "../common/overall.types";

//sigmoid curve function which is used in all development curves
function sigmoidCurve(startAge: number, currentAbility: number, endAge: number, potentialAbility: number) {
  if(startAge >= endAge) {
    throw new Error("incorrect ages passed in for new gen");
  }

  let x0 = (startAge + endAge) / 2;
  let k = (4.0/ (endAge - startAge));

  const logistic = (x: number) => 1 / (1 + Math.exp(-k * (x - x0)));
  const s1 = logistic(startAge);
  const s2 = logistic(endAge);

  const B = (potentialAbility - currentAbility) / (s2 - s1);
  const A = currentAbility - B * s1;

  return (x: number): number => A + B / (1 + Math.exp(-k * (x - x0)));

}

const diffs = (arr: number[]) => arr.slice(1).map((v, i) => v - arr[i]);

//generation of curve deltas for any development path in growth years
export function generateCurveDeltas(age: number, currentAbility: number, potentialAbility: number, baseEndYear: number) {
  let finalAge = baseEndYear + (age - BASE_START_YEAR);
  //discrete age ranges
  const genSigmoid = sigmoidCurve(age, currentAbility, finalAge, potentialAbility);
  const ageRange = Array.from({length: (finalAge - age) * 12}, (_, key) => key).map((x) => x/12 + age);
  const overalls = ageRange.map((x) => genSigmoid(x));
  const normalDeltas = diffs(overalls);

  return normalDeltas;
}

//linear deltas for player age > 20, < 25 for IRL players
//easier than to calculate a curve
export function generateLinearDeltas(age: number, currentAbility: number, potentialAbility: number, baseEndYear: number) {
  const slope = (potentialAbility - currentAbility) / (baseEndYear - age);
  const deltas = Array.from({length: (baseEndYear - age) * 12}, (_, key) => key).map((_) => 1/12 * slope);
  return deltas;
}


//simple linear regression to set overall in peak years
export function setNextMonthOverallInPlateau(age: number, startDeclineAge: number, currentAbility: number, potentialAbility: number) {
  return (potentialAbility - currentAbility) / (startDeclineAge - age) * 1/12 + currentAbility;
}

//negative gompertz function for decline
export function calculateDeclineOverall(age: number, coeffs: GompertzCoeff) {
  return coeffs.yOffset + coeffs.a * Math.exp(-coeffs.b * Math.exp(coeffs.c * (age - coeffs.xOffset)));
}

//calculating coefficients for downward Gompertz
export function gompertzCoeffCalculation(age: number, endDeclineAge: number, currentAbility: number, endCurrentAbility: number): GompertzCoeff {
  const b = -Math.log((currentAbility - 0.1 - endCurrentAbility)/(currentAbility - endCurrentAbility));
  const c = -Math.log(-Math.log(0.1/(currentAbility - endCurrentAbility))/b) / (endDeclineAge - age);
  return {
    yOffset: endCurrentAbility,
    a: currentAbility - endCurrentAbility,
    b: b,
    c: c,
    xOffset: age
  };
}