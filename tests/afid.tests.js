
const afid = require('../dist/afid');

{
  It`should expose the version`;
  assert(Boolean(afid.version), "Missing version");
}

{
  It`should generate an identifier`;
  const result = afid();
  assert(result.length === 8, "Too short");
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]+$/.test(result), "Invalid characters");
  assert(!/[A-Z]{3}/.test(result), "Too many sequential letters");
  assert(!/\d{5}/.test(result), "Too many sequential numbers");
}

{
  It`should allow customizing the length`;
  const result = afid(12);
  assert(result.length === 12, "Too short");
  let error;
  try {
    afid(0);
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for 0");
  try {
    afid(-10);
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for negative");
  try {
    afid('abc');
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for letters");
  try {
    afid(null);
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for null");
  try {
    afid(NaN);
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for NaN");
}


{
  It`should allow customizing the length via options`;
  const result = afid({ length: 14 });
  assert(result.length === 14, "Too short");
}

{
  It`should allow a prefix`;
  const result = afid({ prefix: 'CLIENT' });
  assert(result.length === 14, "Too short");
  assert(/^CLIENT[ACDEFGHJKMNPQRTUVWXY2346789]+$/.test(result), "Invalid characters");
}

{
  It`should allow a suffix`;
  const result = afid({ suffix: 'xyz' });
  assert(result.length === 11, "Too short");
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]+xyz$/.test(result), "Invalid characters");
}

{
  It`should allow forcing start with a letter`;
  let fail = false;
  for (let i = 0; i < 100; i++) {
    const result = afid({ start: "letter" });
    fail = !/^[ACDEFGHJKMNPQRTUVWXY]{1}/.test(result);
    if (fail) {
      break;
    }
  }
  assert(!fail, "Wrong starting character type");
}

{
  It`should allow forcing start with a number`;
  let fail = false;
  for (let i = 0; i < 100; i++) {
    const result = afid({ start: "number" });
    fail = !/^[2346789]{1}/.test(result);
    if (fail) {
      break;
    }
  }
  assert(!fail, "Wrong starting character type");
}

{
  It`should throw if unknown start type`;
  let error;
  try {
    afid({ start: "any" });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for wrong type");
}

{
  It`should throw if unknown start type`;
  let error;
  try {
    afid({ start: "any" });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for wrong type");
}

{
  It`should segment`;
  const result = afid({ segments: 2 });
  assert(result.length === 9, "Wrong length");
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{4}$/.test(result), "Invalid characters or format");
}

{
  It`should throw for zero segments`;
  let error;
  try {
    afid({ segments: 0 });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for 0");
}

{
  It`should throw for negative segments`;
  let error;
  try {
    afid({ segments: 0 });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for 0");
}

{
  It`should throw for NaN segments`;
  let error;
  try {
    afid({ segments: "asdf" });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for NaN");
}

{
  It`should segment different lengths`;
  const result = afid({ segments: 4, length: 16 });
  assert(result.length === 19, "Wrong length");
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{4}$/.test(result), "Invalid characters or format");
}

{
  It`should segment odd lengths`;
  const result = afid({ segments: 2, length: 7 });
  assert(result.length === 8, "Wrong length");
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{3}$/.test(result), "Invalid characters or format");
}

{
  It`should allow a custom separator`;
  const result = afid({ segments: 2, separator: "__" });
  assert(result.length === 10, "Wrong length");
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]{4}__[ACDEFGHJKMNPQRTUVWXY2346789]{4}$/.test(result), "Invalid characters or format");
}

{
  It`should not use the separator with prefixes and suffixes when segmenting`;
  const result = afid({ segments: 2, prefix: "ACME-", suffix: "-2023", separator: "_" });
  assert(result.length === 19, "Wrong length");
  assert(/^ACME-[ACDEFGHJKMNPQRTUVWXY2346789]{4}_[ACDEFGHJKMNPQRTUVWXY2346789]{4}-2023$/.test(result), "Invalid characters or format");
}

{
  It`should throw if it takes too many loops`;
  const realRandom = Math.random;
  Math.random = () => 4;
  let result;
  let error;
  try {
    result = afid();
  } catch (e) {
    error = e;
  }
  assert(!result && error, "Did not throw");
  Math.random = realRandom;
}

{
  It`should avoid creating exponential notation through forcing another letter by the end`;
  const realRandom = Math.random;
  // Return a specific sequences of "random" values
  // to ensure a stable result and test it makes the exact
  // expected calls to Math.random.
  const nums = [
    0,    // -> numbers
    0/7,  // 2
          // -> stay on numbers (skip exponent check since no E yet)
    0.9,  // -> stay on numbers (coin toss)
    1/7,  // 3
    0,    // -> letters
    3/20, // E
    0,    // -> numbers
    1/7,  // 3
    0.9,  // -> stay on numbers (exponent check)
    0.9,  // -> stay on numbers (coin toss)
    2/7,  // 4
    0.9,  // -> stay on numbers (exponent check)
    0.9,  // -> stay on numbers (coin toss)
    3/7,  // 6
    0.9,  // -> letters (try stay on numbers but exponent check forces weight to 1)
    2/20, // D
  ];
  Math.random = () => {
    const n = nums.shift();
    return n;
  };
  const result = afid(7);
  assert("23E346D" === result, `Unexpected result: ${ result }`);
  Math.random = realRandom;
}

{
  It`should detect when exponent safe due to non-E`;
  const realRandom = Math.random;
  // Return a specific sequences of "random" values
  // to ensure a stable result and test it makes the exact
  // expected calls to Math.random.
  const nums = [
    0,    // -> numbers
    0/7,  // 2
          // -> stay on numbers (skip exponent check since no E yet)
    0.9,  // -> stay on numbers (coin toss)
    1/7,  // 3
    0,    // -> letters
    5/20, // G (flips is_exponent_safe)
    0,    // -> numbers
    1/7,  // 3
          // -> stay on numbers (skip exponent check since non-E)
    0.9,  // -> stay on numbers (coin toss)
    2/7,  // 4
          // -> stay on numbers (skip exponent check)
    0.9,  // -> stay on numbers (coin toss)
    3/7,  // 6
          // -> stay on numbers (skip exponent check)
    0.9,  // -> stay on numbers (coin toss)
    2/7,  // 4
  ];
  Math.random = () => {
    const n = nums.shift();
    return n;
  };
  const result = afid(7);
  assert("23G3464" === result, `Unexpected result: ${ result }`);
  Math.random = realRandom;
}

{
  It`should detect when exponent safe due to multiple Es`;
  const realRandom = Math.random;
  // Return a specific sequences of "random" values
  // to ensure a stable result and test it makes the exact
  // expected calls to Math.random.
  const nums = [
    0,    // -> numbers
    0/7,  // 2
    0,    // -> letters (coin toss)
    3/20, // E
    0,    // -> numbers
    1/7,  // 3
    0,    // -> letters
    3/20,  // E
    0,    // -> numbers
    2/7,  // 4
          // -> skip exponent check
    0.9,  // -> stay on numbers (coin toss)
    3/7,  // 6
          // -> skip exponent check
    0.9,  // -> stay on numbers (coin toss)
    2/7,  // 4
  ];
  Math.random = () => {
    const n = nums.shift();
    return n;
  };
  const result = afid(7);
  assert("2E3E464" === result, `Unexpected result: ${ result }`);
  Math.random = realRandom;
}

{
  It`should detect when exponent safe due to first-position E`;
  const realRandom = Math.random;
  // Return a specific sequences of "random" values
  // to ensure a stable result and test it makes the exact
  // expected calls to Math.random.
  const nums = [
    0.9,  // -> letters
    3/20, // E
    0,    // -> numbers (coin toss)
    0/7,  // 2
    0.9,  // -> numbers
    1/7,  // 3
    0.9,  // -> numbers
    0/7,  // 2
    0.9,  // -> still numbers (no exponent check)
    1/7,  // 3
  ];
  Math.random = () => {
    const n = nums.shift();
    return n;
  };
  const result = afid(5); // Shorten to 5 to avoid the from-set limit
  assert("E2323" === result, `Unexpected result: ${ result }`);
  Math.random = realRandom;
}


{
  It`should take a reasonable time to generate an identifier`;
  const { hrtime } = require("node:process");
  const durations = [];
  function run () {
    const start = hrtime.bigint();
    afid();
    const end = hrtime.bigint();
    durations.push(end - start);
  }

  for (let i = 0; i < 10000; i++) {
    run();
  }
  const avg = durations.reduce((t,v) => t + v) / BigInt(durations.length);
  assert(avg < BigInt(10_000), `Average execution exceeded 10k nanoseconds: ${ avg }`);
}

