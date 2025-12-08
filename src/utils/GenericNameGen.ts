import bProb from '../data/dual_nationality/base_probs.json'  with { type: 'json' };
import dualNats from '../data/dual_nationality/dual_nats.json'  with { type: 'json' };
import { generateName } from 'fifa-name-generator';
import { fullMappings } from '../data/dual_nationality/groups.js';
import nations from "../data/nations.json"; 
import { GeneratedName } from 'src/common/names.interfaces';

const DUAL_NATIONALITIES = dualNats as Record<string, Record<string, number>>;
const nationsData = nations as Record<string, string>;
const invertedNations: Record<string, string> = Object.fromEntries(
  Object.entries(nationsData).map(([key, value]) => [value, key])
);
const baseProbs = bProb as Record<string, number>;
const eur_groups = fullMappings as Record<string, Record<string, Record<string, number>>>;

const countryCodes = new Set([
  "AFG","ALB","ALG","ASA","AND","ANG","AIA","ATG","ARG","ARM","ARU","AUS","AUT","AZE",
  "BAH","BHR","BAN","BRB","BLR","BEL","BLZ","BEN","BER","BHU","BOL","BIH","BOT","BRA",
  "VGB","BRU","BUL","BFA","BDI","CAM","CMR","CAN","CPV","CAY","CTA","CHA","CHI","CHN",
  "TPE","COL","COM","CGO","COK","CRC","CRO","CUB","CUW","CYP","CZE","DEN","DJI","DMA",
  "DOM","COD","ECU","EGY","SLV","ENG","EQG","ERI","EST","SWZ","ETH","FRO","FIJ","FIN",
  "FRA","GAB","GAM","GEO","GER","GHA","GIB","GRE","GRN","GUM","GUA","GUI","GNB","GUY",
  "HAI","HON","HKG","HUN","ISL","IND","IDN","IRN","IRQ","ISR","ITA","CIV","JAM","JPN",
  "JOR","KAZ","KEN","KVX","KUW","KGZ","LAO","LVA","LBN","LES","LBR","LBY","LIE","LTU",
  "LUX","MAC","MKD","MAD","MWI","MAS","MDV","MLI","MLT","MTN","MRI","MEX","MDA","MNG",
  "MNE","MSR","MAR","MOZ","MYA","NAM","NEP","NED","NCL","NZL","NCA","NIG","NGA","PRK",
  "NIR","NOR","OMA","PAK","PLE","PAN","PNG","PAR","PER","PHI","POL","POR","PUR","QAT",
  "IRL","ROU","RUS","RWA","SKN","LCA","VIN","SAM","SMR","STP","KSA","SCO","SEN","SRB",
  "SEY","SLE","SIN","SVK","SVN","SOL","SOM","RSA","KOR","SSD","ESP","SRI","SUD","SUR",
  "SWE","SUI","SYR","TAH","TJK","TAN","THA","TLS","TOG","TGA","TRI","TUN","TUR","TKM",
  "TCA","UGA","UKR","UAE","USA","URU","VIR","UZB","VAN","VEN","VIE","WAL","YEM","ZAM",
  "ZIM","TUV","KIR","FSM","NMI","ZAN","REU","MTQ","GLP","BOE","SXM","GRL","GUF"
]);

export function getAbbreviatedName(nationName: string): string {
  if(nationName in invertedNations) {
    return nationName;
  } else if(nationName in nationsData) {
    return nationsData[nationName];
  }
  return "";
}

export function getFullName(nationName: string): string {
  if(nationName in nationsData) {
    return nationName;
  } else if(nationName in invertedNations) {
    return invertedNations[nationName];
  }
  return "";
}


export function realisticNameGenerator(nat: string): GeneratedName {
  //first we rand gen a probability
  const num = Math.random();
  const nationality = getAbbreviatedName(nat);
  const fullPrimaryNatName = getFullName(nat);
  //if num > our cap, no second nat and just gen a nation
  if(num > baseProbs[nationality]) {
    const genName : string = generateName(nationality);
    return {
      name: genName,
      nationality: fullPrimaryNatName
    };
  } else {
    //let's get our 2nd nationality
    const randNat = getRandomNationality(DUAL_NATIONALITIES[nationality]);
    //there are some special cases for the second nationality, so let's cover them
    //there are 3 cases: 3-letter abbrev, 'GENERAL', or a continent name
    switch(randNat!.length) {
      case 3:
        //this is a nation
        const genAbbrName: string = generateName(nationality, randNat);
        return {
          name: genAbbrName,
          nationality: fullPrimaryNatName,
          secondaryNationality: getFullName(randNat!)
        };
      case 7:
        //this is 'general'
        const newArr = [...new Set([...countryCodes].filter(code => code !== nationality))];
        const secGenNat = newArr[Math.floor(Math.random() * newArr.length)];
        const genGeneralName : string = generateName(nationality, secGenNat);
        return {
          name: genGeneralName,
          nationality: fullPrimaryNatName,
          secondaryNationality: getFullName(secGenNat!)
        };
      default:
        //this is the continent case
        const countryDict = eur_groups[nationality][randNat!];
        const secNat = getRandomNationality(countryDict)!;
        const genContiName : string = generateName(nationality, secNat);
        return {
          name: genContiName,
          nationality: fullPrimaryNatName,
          secondaryNationality: getFullName(secNat!)
        };
    }
  }
}

export function getRandomNationality(probabilities: Record<string, number>) {
  const entries = Object.entries(probabilities);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let r = Math.random() * total;

  for (const [key, weight] of entries) {
    if (r < weight) return key;
    r -= weight;
  }

  return undefined; // fallback (shouldn't happen if values > 0)
}

  