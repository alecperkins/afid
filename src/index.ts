
export interface AfidOptions {
  length?: number;
  start?: "random" | "letter" | "number";
  prefix?: string;
  suffix?: string;
  segments?: number;
  separator?: string;
}

// Omits ambiguous characters (I/1/l, O/0, Z for 2, B for 8)
const LETTERS = "ACDEFGHJKMNPQRTUVWXY";
const NUMBERS = "2346789";
const OPTION_DEFAULTS: AfidOptions = {
  length      : 8,
  start       : "random",
  prefix      : "",
  suffix      : "",
  segments    : 1,
  separator   : "-",
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
 * @param options.length - (8) The number of random characters in the identifier (excluding prefix, suffix, separators).
 * @param options.start - ('random') Whether the identifier should start with a letter, number, or randomly either.
 * @param options.prefix - ('') A prefix to add to the identifier.
 * @param options.suffix - ('') A suffix to include to the identifier.
 * @param options.segments - (1) The number of groupings of characters, delimited by `options.separator` (excludes prefix/suffix).
 * @param options.separator - ('-') The character to separate segments with (excludes prefix/suffix).
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
    throw new Error("options.length must be a positive, non-zero integer");
  }
  if (!_options.segments || typeof _options.segments !== "number" || _options.segments < 1) {
    throw new Error("options.segments must be a positive, non-zero integer");
  }

  let charsets: [string, string];
  if (_options.start === "letter") {
    charsets = [LETTERS, NUMBERS];
  } else if (_options.start === "number") {
    charsets = [NUMBERS, LETTERS];
  } else if (_options.start && _options.start !== "random") {
    throw new Error("Unknown options.start type");
  } else if (coinToss()) {
    charsets = [NUMBERS, LETTERS];
  } else {
    charsets = [LETTERS, NUMBERS];
  }

  let num_from_set = 0;
  let num_tries = 0;

  let segment: Array<string> = [];
  const picked: Array<string> = [];
  let num_picked = 0;
  let prev_picked = '';
  let is_exponent_safe = true;
  let num_es = 0;
  let num_letters = 0;

  const segment_max_size = Math.ceil(_options.length / _options.segments);

  while (num_picked < _options.length) {
    const current_set = charsets[0];
    const next_char = pickRandomChar(current_set);
    // Track how many Es and non-E letters have been used so we can ensure
    // the output does not resemble exponential notation.
    if (
      (
        // This only really matters for unsegmented ids.
        _options.segments < 2
        || (
          _options.segments < 3
          && _options.separator !== '.'
        )
      ) && current_set === LETTERS
    ) {
      num_letters += 1;
      if (next_char === "E") {
        num_es += 1;
        if (num_es > 1) {
          is_exponent_safe = true;
        } else if (
          num_letters < 2 // Only one E
          && num_picked > 1 // Not the first
          && num_picked < _options.length - 1 // Not the last
        ) {
          // If there is an E that is the only letter
          // and isn't in the first or last position,
          // consider the in-progress identifier as
          // resembling an exponent.
          is_exponent_safe = false;
        }
      } else if (!is_exponent_safe) {
        is_exponent_safe = true;
      }
    }

    // No two of the same in a row
    if (next_char !== prev_picked) {
      segment.push(next_char);
      prev_picked = next_char;
      num_picked += 1;
      num_from_set += 1;

      if (
        segment.length === segment_max_size
        || num_picked === _options.length
      ) {
        picked.push(segment.join(''));
        segment = [];
      }

      // No more than 2 letters in a row to avoid forming words,
      // no more than 4 numbers in a row for easier memorization or conveyance
      // (the letters punctuate the number groups).
      if (
        (current_set === LETTERS && num_from_set === 2)
        || (current_set === NUMBERS && num_from_set === 4)
        || (
          (
            // If the ID is not yet exponent safe, increasingly favor letters.
            !is_exponent_safe
            && current_set === NUMBERS
            && coinToss((num_picked + 1) / _options.length) // This will approach and reach 1 by the end, forcing a second letter by the end if not exponent safe yet.
          )
          || coinToss(0.25)
        )
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

  return `${ _options.prefix }${ picked.join(_options.separator) }${ _options.suffix }`;
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
