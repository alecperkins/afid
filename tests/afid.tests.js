
const afid = require('../dist/afid');

{
  It`should expose the version`;
  assert(Boolean(afid.version), "Missing version");
}

{
  It`should generate an identifier`;
  const result = afid();
  assert(result.length === 8, `Too short: ${ result }`);
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]+$/.test(result), `Invalid characters: ${ result }`);
  assert(!/[A-Z]{3}/.test(result), `Too many sequential letters: ${ result }`);
  assert(!/\d{5}/.test(result), `Too many sequential numbers: ${ result }`);
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
  error = undefined;
  try {
    afid(-10);
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for negative");
  error = undefined;
  try {
    afid('abc');
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for letters");
  error = undefined;
  try {
    afid(null);
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for null");
  error = undefined;
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
  assert(result.length === 14, `Too short: length ${ result.length }`);
}

{
  It`should allow a prefix`;
  const result = afid({ prefix: 'CLIENT' });
  assert(result.length === 14, "Too short");
  assert(/^CLIENT[ACDEFGHJKMNPQRTUVWXY2346789]+$/.test(result), `Invalid characters: ${ result.length }`);
}

{
  It`should allow a suffix`;
  const result = afid({ suffix: 'xyz' });
  assert(result.length === 11, `Too short: length ${ result.length }`);
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]+xyz$/.test(result), `Invalid characters: ${ result }`);
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
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{4}$/.test(result), `Invalid characters or format: ${ result }`);
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
    afid({ segments: -3 });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for negative");
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
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{4}$/.test(result), `Invalid characters or format: ${ result }`);
}

{
  It`should segment odd lengths`;
  const result = afid({ segments: 2, length: 7 });
  assert(result.length === 8, "Wrong length");
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]{4}-[ACDEFGHJKMNPQRTUVWXY2346789]{3}$/.test(result), `Invalid characters or format: ${ result }`);
}

{
  It`should allow a custom separator`;
  const result = afid({ segments: 2, separator: "__" });
  assert(result.length === 10, "Wrong length");
  assert(/^[ACDEFGHJKMNPQRTUVWXY2346789]{4}__[ACDEFGHJKMNPQRTUVWXY2346789]{4}$/.test(result), `Invalid characters or format: ${ result }`);
}

{
  It`should not use the separator with prefixes and suffixes when segmenting`;
  const result = afid({ segments: 2, prefix: "ACME-", suffix: "-2023", separator: "_" });
  assert(result.length === 19, "Wrong length");
  assert(/^ACME-[ACDEFGHJKMNPQRTUVWXY2346789]{4}_[ACDEFGHJKMNPQRTUVWXY2346789]{4}-2023$/.test(result), `Invalid characters or format: ${ result }`);
}

{
  It`should not use ambiguous characters`;
  let result;
  for (let i = 0; i < 10_000; i++) {
    result = afid();
    if (/[I10OZB]+/.test(result)) {
      break;
    }
    result = null;
  }
  assert(!result, `Includes ambiguous characters: ${result}`);
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
  It`should not generate identifiers that parse as numbers`;
  let result;
  for (let i = 0; i < 20_000; i++) {
    result = afid(6);
    if (!Number.isNaN(Number(result))) {
      break;
    }
    result = null;
  }
  assert(!result, `Parses as a number: ${ result } -> ${ Number(result) }`);
}

{
  It`should not generate segmented identifiers that parse as numbers`;
  // A single separator can still be part of a number: '.' as the decimal
  // point, '-' or '+' as the sign of an exponent. An empty separator leaves
  // the characters running together, the same as an unsegmented id.
  const cases = [
    { segments: 2, separator: ".", length: 6 },
    { segments: 2, separator: ".", length: 9 },
    { segments: 2, separator: "-", length: 6 },
    { segments: 2, separator: "+", length: 6 },
    { segments: 2, separator: "", length: 6 },
    { segments: 3, separator: "", length: 6 },
  ];
  for (const options of cases) {
    let result;
    for (let i = 0; i < 20_000; i++) {
      result = afid(options);
      if (!Number.isNaN(Number(result))) {
        break;
      }
      result = null;
    }
    assert(!result, `Parses as a number: ${ result } -> ${ Number(result) } (${ JSON.stringify(options) })`);
  }
}

{
  It`should avoid exponential notation with an E in the second position`;
  const realRandom = Math.random;
  // A recorded sequence of "random" values that produced "6E9349".
  // Falls back to real randomness if the fix consumes more values.
  const nums = [
    0.2509140331253267,
    0.5561177795374205,
    0.0876523070444103,
    0.1686592935599326,
    0.09743155803238479,
    0.9193105513912873,
    0.8505382733895904,
    0.14811910269819273,
    0.5288512088399576,
    0.4281548033799547,
    0.516472033600968,
    0.9020646914279392,
  ];
  Math.random = () => nums.length > 0 ? nums.shift() : realRandom();
  const result = afid(6);
  Math.random = realRandom;
  assert(Number.isNaN(Number(result)), `Parses as a number: ${ result }`);
}

{
  It`should avoid exponential notation with an E in the next-to-last position`;
  const realRandom = Math.random;
  // A recorded sequence of "random" values that produced "4864E8".
  // Falls back to real randomness if the fix consumes more values.
  const nums = [
    0.3447079585551176,
    0.35706973393361185,
    0.943621748489219,
    0.7839879255241614,
    0.7268707171141423,
    0.5658089977218841,
    0.695892882029431,
    0.3741131412009747,
    0.19530485389418983,
    0.2033243599430029,
    0.7800889919772408,
    0.5048670109835471,
  ];
  Math.random = () => nums.length > 0 ? nums.shift() : realRandom();
  const result = afid(6);
  Math.random = realRandom;
  assert(Number.isNaN(Number(result)), `Parses as a number: ${ result }`);
}

{
  It`should produce the requested number of segments`;
  const cases = [
    [{ segments: 5, length: 8 }, 5],
    [{ segments: 5, length: 12 }, 5],
    [{ segments: 4, length: 6 }, 4],
    [{ segments: 3, length: 8 }, 3],
    [{ segments: 2, length: 7 }, 2],
  ];
  for (const [options, expected] of cases) {
    const result = afid(options);
    const parts = result.split("-");
    assert(parts.length === expected, `Expected ${ expected } segments, got ${ parts.length }: ${ result }`);
    assert(
      result.replace(/-/g, "").length === options.length,
      `Expected ${ options.length } characters, got ${ result.replace(/-/g, "").length }: ${ result }`,
    );
    assert(
      parts.every(p => Math.abs(p.length - parts[0].length) <= 1),
      `Segments differ by more than one character: ${ result }`,
    );
  }
}

{
  It`should throw for more segments than characters`;
  let error;
  try {
    afid({ segments: 5, length: 3 });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for segments greater than length");
}

{
  It`should throw for non-integer length`;
  let error;
  try {
    afid(2.5);
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for fractional length");
  error = undefined;
  try {
    afid({ length: 8.5 });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for fractional options.length");
}

{
  It`should throw for infinite length`;
  let error;
  try {
    afid({ length: Infinity });
  } catch (e) {
    error = e;
  }
  assert(
    error && /integer/.test(error.message),
    `Did not throw a validation error for Infinity: ${ error && error.message }`,
  );
}

{
  It`should throw for non-integer segments`;
  let error;
  try {
    afid({ segments: 1.5 });
  } catch (e) {
    error = e;
  }
  assert(error, "Did not throw for fractional segments");
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

