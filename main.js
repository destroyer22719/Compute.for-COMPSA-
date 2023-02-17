// https://bigprimes.org/RSA-challenge

async function main() {
  const { BigNumber } = require("bignumber.js");
  BigNumber.config({ EXPONENTIAL_AT: 1e9 });
  const compute = require("dcp/compute");

  const RSA = new BigNumber("897710095327");

  // making input sets
  function makeIntervals(n, total) {
    const piece = total.dividedToIntegerBy(n);
    const intervals = [];

    for (let i = 0; i < n; i++) {
      intervals.push({
        start: piece.multipliedBy(i).plus(1).toString(),
        stop: piece
          .multipliedBy(i + 1)
          .plus(1)
          .toString(),
        num: RSA.toString(),
      });
    }

    intervals[n - 1].stop = total.plus(total.minus(piece.multipliedBy(n)));

    return intervals;
  }

  // work function
  function findRSA(data) {
    function power(x, y, p) {
      let res = 1n;

      x %= p;
      while (y > 0n) {
        if (y & 1n) res = (res * x) % p;

        y /= 2n;
        x = (x * x) % p;
      }
      return res;
    }

    function miillerTest(d, n) {
      const r = BigInt(Math.floor(Math.random() * 100_000));
      const y = (r * (n - 2n)) / 100_000n;
      const a = 2n + (y % (n - 4n));

      // Compute a^d % n
      let x = power(a, d, n);

      if (x == 1n || x == n - 1n) return true;

      while (d != n - 1n) {
        x = (x * x) % n;
        d *= 2n;

        if (x == 1n) return false;
        if (x == n - 1n) return true;
      }

      return false;
    }

    function isPrime(n, k = 40) {
      if (n <= 1n || n == 4n) return false;
      if (n <= 3n) return true;

      let d = n - 1n;
      while (d % 2n == 0n) d /= 2n;

      // Iterate given nber of 'k' times
      for (let i = 0; i < k; i++) if (!miillerTest(d, n)) return false;

      return true;
    }

    progress(0);
    let { start, stop, num } = data;
    const { BigNumber } = require("bignumber.js");
    BigNumber.config({ EXPONENTIAL_AT: 1e9 });

    start = new BigNumber(start);
    stop = new BigNumber(stop);
    const RSA = new BigNumber(num);
    for (let i = start; i < stop; i++) {
      // This code gives a bug?
      // progress(`${i}/${RSA.sqrt().decimalPlaces(0, 1).toString()}`);
      if (RSA.mod(i).isZero()) {
        if (isPrime(BigInt(i.toString()))) {
          const x = RSA.dividedBy(i);
          if (x.isInteger()) {
            return [i.toString(), x.toString()];
          }
        }
      }
    }

    return "nothing found";
  }

  const inputSet = makeIntervals(5, RSA.sqrt().decimalPlaces(0, 1));

  const job = compute.for(inputSet, findRSA);
  job.requires("bignumber.js");

  job.on("result", (ev) => {
    if (ev.result !== "nothing found") {
      console.log(ev.result);
      process.exit(0);
    }
  });

  // const resultSet = await job.exec();
  const resultSet = await job.localExec();
  console.log(resultSet);
}

require("dcp-client").init("https://scheduler.distributed.computer").then(main);
