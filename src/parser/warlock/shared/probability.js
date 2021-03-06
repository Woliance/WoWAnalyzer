/**
 * Recursive formula for calculating the PMF (probability mass function) of Poisson's Binomial Distribution
 * @param k {Number} Number of desired positive outcomes
 * @param j {Number} Number of total tries
 * @param p {[Number]} Probability vector
 * @param lookup {Array} Lookup table
 * @returns {Number} Probability
 */
function Ekj(k, j, p, lookup) {
  if (k === -1) {
    return 0;
  }
  if (k === j+1) {
    return 0;
  }
  if (k === 0 && j === 0) {
    return 1;
  }
  if (lookup[k][j] !== null) {
    return lookup[k][j];
  }
  // literature uses 1-based indices for probabilities, as we're using an array, we have to use 0 based
  const value = (1 - p[j-1]) * Ekj(k, j-1, p, lookup) + p[j-1] * Ekj(k-1, j-1, p, lookup);
  lookup[k][j] = value;
  return value;
}

// Poisson's Binomial Distribution
// Methods based on Wikipedia page and this research paper:
// https://www.researchgate.net/publication/257017356_On_computing_the_distribution_function_for_the_Poisson_binomial_distribution

/**
 * Calculates the probability that out of n tries with p probabilities, we get exactly k positive outcomes
 * @param k {Number} Number of desired positive outcomes
 * @param n {Number} Number of total tries
 * @param p {[Number]} Probability vector
 */
export function poissonBinomialPMF(k, n, p) {
  // denoted in the paper as ξk, I'll call it Ek for simplicity
  // using the recursive formula in chapter 2.5
  if (p.length !== n) {
    throw new Error("You must supply a probability vector with the same length as the number of total tries into Poisson Binomial PMF");
  }
  // Using a lookup table to simplify recursion a little bit
  // construct an (n+1) x (n+1) lookup table (because Ek,j uses indexes from 0 to n INCLUSIVE, with this we don't have to subtract indexes all the time)
  // intentionally set tu nulls so we know which values are computed or not
  const lookup = [...Array(n+1)].map(_ => Array(n + 1).fill(null));
  return Ekj(k, n, p, lookup);
}

/**
 * Calculates the probability that out of n tries with p probabilities, we get less than or equal k positive outcomes
 * @param k {Number} Number of desired positive outcomes
 * @param n {Number} Number of total tries
 * @param p {[Number]} Probability vector
 */
export function poissonBinomialCDF(k, n, p) {
  // While technically equal to summing Ei from i = 0 to k, since we use recursion, a better solution is a lookup table
  if (p.length !== n) {
    throw new Error("You must supply a probability vector with the same length as the number of total tries into Poisson Binomial CDF");
  }
  // see comments in poissonBinomialPMF
  const lookup = [...Array(n+1)].map(_ => Array(n+1).fill(null));
  let probability = 0;
  // since Ekj uses the values from "previous row" (Ekj(k - 1, j - 1, ...)), it's better to iterate from 0
  // this way, it produces the least necessary amount of calculations with the lookup table (only the Ekj(k, j - 1) parts)
  for (let i = 0; i <= k; i++) {
    probability += Ekj(i, n, p, lookup);
  }
  return probability;
}

// Binomial Distribution

function bin(n, k) {
  // n! / (k! * (n - k)!)
  // factorials are awful, let's simplify a bit
  // we know k < n:
  // numerator: n! = 1 * 2 * ... * (n - k) * (n - k + 1) * (n - k + 2 ) * ... * n
  // denominator: k! * (n - k)! = k! * 1 * 2 * ... * (n - k)
  // cancelling out 1 * 2 * ... * (n - k) from both we get:
  // (n - k + 1) * (n - k + 2) * ... n / k!
  let numerator = 1;
  let denominator = 1;
  for (let i = n - k + 1; i <= n; i++) {
    numerator *= i;
  }
  for (let i = 1; i <= k; i++) {
    denominator *= i;
  }
  return numerator / denominator;
}

/**
 * Calculates the probability that out of n tries with probability p, we get exactly k positive outcomes
 * @param k {Number} Number of desired positive outcomes
 * @param n {Number} Number of tries
 * @param p {Number} Probability of positive outcome
 */
export function binomialPMF(k, n, p) {
  return bin(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

/**
 * Calculates the probability that out of n tries with probability p, we get k or less positive outcomes
 * @param k {Number} Number of desired positive outcomes
 * @param n {Number} Number of tries
 * @param p {Number} Probability of positive outcome
 */
export function binomialCDF(k, n, p) {
  let probability = 0;
  for (let i = 0; i <= k; i++) {
    probability += binomialPMF(i, n, p);
  }
  return probability;
}

/**
 * Finds the maximum of PMF of given distribution. Meant to be used with `binomialPMF` or `poissonBinomialPMF` (because of the shape).
 * @param n {Number} Maximum number of tries for given event
 * @param p {Number|[Number]} Probability or probability vector
 * @param pmf {Function} PMF function - meant to be `binomialPMF` or `poissonBinomialPMF`
 * @returns Maximum of given PMF function - argument and probability itself
 */
export function findMax(n, p, pmf) {
  // Since Binomial and Poisson binomial distributions both have bell like shape, we can iterate upwards from k = 0
  // When the probability starts to decrease, we've found the local (and global) maximum of the function and we can break and return
  let max = -1;
  let maxP = 0;
  for (let i = 0; i <= n; i++) {
    const probability = pmf(i, n, p);
    if (probability > maxP) {
      max = i;
      maxP = probability;
    } else if (probability < maxP) {
      break;
    }
  }
  return {
    max,
    p: maxP,
  };
}
