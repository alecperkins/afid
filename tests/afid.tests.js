
const afid = require('../dist/afid');

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
