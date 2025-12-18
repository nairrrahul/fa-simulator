/** General RNG functions */
export function gauss(mean = 0, std = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // avoid 0
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * std + mean;
}

export function uniform(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function truncatedNormal(mean: number, sd: number, low: number, high: number) {
  for(let i = 0; i < 1000; i++) {
    let x = gauss(mean, sd);
    if (x >= low && x <= high) {
      return x;
    }
  }
  return Math.max(low, Math.min(mean, high));
}

// list shuffle

export function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();  
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}