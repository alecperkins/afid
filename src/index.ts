// Omits ambiguous characters (I/1/l, O/0, Z for 2, B for 8)
const LETTERS = "ACDEFGHJKMNPQRTUVWXY";
const NUMBERS = "2346789";

/**
 * Generate a short random identifier with affordances for human usage.
 * Omits ambiguous characters and avoids forming words or too many
 * sequences of one type of character.
 * 
 * @remarks
 * The identifiers are not securely generated and are typically short.
 * Do not rely on them being secret or unguessable!
 * 
 * @param length - (8) The character length of the identifier.
 * 
 * @returns A random identifier.
 */
function afid (length: number = 8) {

  if (!length || typeof length !== "number" || length < 1) {
    throw new Error("Length must be a positive, non-zero integer");
  }

  const picked: Array<string> = [];

  let charsets: [string, string];
  if (coinToss()) {
    charsets = [NUMBERS, LETTERS];
  } else {
    charsets = [LETTERS, NUMBERS];
  }

  let num_from_set = 0;
  let num_tries = 0;

  while (picked.length < length) {
    const current_set = charsets[0];
    const next_char = pickRandomChar(current_set);
    // No two of the same in a row
    if (next_char !== picked[picked.length - 1]) {
      picked.push(next_char);
      num_from_set += 1;
      // No more than 2 letters or 4 numbers in a row to avoid forming words
      if (
        (current_set === LETTERS && num_from_set === 2)
        || (current_set === NUMBERS && num_from_set === 4)
        || coinToss(0.25)
       ) {
        num_from_set = 0;
        charsets.push(charsets.shift()!);
      }
      num_tries = 0;
    } else if (num_tries === 10) {
      throw new Error("Too many loops picking non-repeating characters.");
    } else {
      num_tries += 1;
    }
  }

  return picked.join('');
}

export default (afid as typeof afid & { version: string });

function coinToss (weight = 0.5) {
  const result = Math.random() < weight;
  return result;
}

function pickRandomChar (charset: string) {
  // Math.random is okay because the identifier is not a "secure" value.
  const i = Math.floor(Math.random() * charset.length);
  const choice = charset[i];
  return choice;
}

