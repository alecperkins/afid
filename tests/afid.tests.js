
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
