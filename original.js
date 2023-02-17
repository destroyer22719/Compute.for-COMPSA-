const { checkPrimeSync } = require("node:crypto");
const BigNumber = require("bignumber.js");

BigNumber.config({ EXPONENTIAL_AT: 1e9 });
const RSA = new BigNumber("897710095327");

// https://bigprimes.org/RSA-challenge
function findRSA() {
  for (let i = 1; i < RSA.sqrt().decimalPlaces(0, 1).toNumber(); i++) {
    // console.log(`${i}/${RSA.sqrt().decimalPlaces(0, 1).toString()}`);
    if (RSA.mod(i).isZero()) {
      if (checkPrimeSync(BigInt(i.toString()))) {
        let x = RSA.dividedBy(i);
        if (x.isInteger()) {
          return [i.toString(), x.toString()];
        }
      }
    }
  }
}

console.log(findRSA());
