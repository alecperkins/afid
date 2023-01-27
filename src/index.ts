
export interface AfidOptions {
  length: number;
  prefix: string;
  suffix: string;
}

// Omits ambiguous characters (I/1/l, O/0, Z for 2, B for 8)
const LETTERS = "ACDEFGHJKMNPQRTUVWXY";
const NUMBERS = "2346789";
const OPTION_DEFAULTS: AfidOptions = {
  length      : 8,
  prefix      : "",
  suffix      : "",
};

/**
 * Generate a short random identifier with affordances for human usage.
 * Omits ambiguous characters and avoids forming words or too many
 * sequences of one type of character.
 * 
 * @remarks
 * The identifiers are not securely generated and are typically short.
 * Do not rely on them being secret or unguessable!
 * 
 * @param options.length - (8) The character length of the identifier (excluding the prefix and suffix).
 * @param options.prefix - ('') A prefix to add to the identifier.
 * @param options.suffix - ('') A suffix to include to the identifier.
 * @param length_or_options - The length directly, for convenience.
 * 
 * @returns A random identifier.
 */
function afid (length_or_options?: number | AfidOptions) {

  let raw_options;
  if (length_or_options !== undefined) {
    if (typeof length_or_options === "number") {
      raw_options = {
        length: length_or_options
      }
    } else {
      raw_options = length_or_options;
    }
  } else {
    raw_options = {};
  }
  const _options = {
    ...OPTION_DEFAULTS,
    ...raw_options,
  };

  if (!_options.length || typeof _options.length !== "number" || _options.length < 1) {
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

  while (picked.length < _options.length) {
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

  return `${ _options.prefix }${ picked.join('') }${ _options.suffix }`;
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
