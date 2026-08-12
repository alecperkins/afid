
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
 * @param options.segments - (1) The number of groupings of characters, delimited by `options.separator` (excludes prefix/suffix). May not exceed `options.length`.
 * @param options.separator - ('-') The character to separate segments with (excludes prefix/suffix).
 * @param length_or_options - The length directly, for convenience.
 *
 * @returns A random identifier.
 */
function afid (length_or_options?: number | AfidOptions) {

  let raw_options: AfidOptions;
  if (length_or_options === undefined) {
    raw_options = {};
  } else if (typeof length_or_options === "number") {
    raw_options = {
      length: length_or_options
    }
  } else if (typeof length_or_options === "object" && length_or_options !== null) {
    raw_options = length_or_options;
  } else {
    // Anything else would silently spread into an empty set of options.
    throw new Error("afid() takes a length or an options object");
  }
  const _options = {
    ...OPTION_DEFAULTS,
    ...raw_options,
  };

  if (typeof _options.length !== "number" || !Number.isInteger(_options.length) || _options.length < 1) {
    throw new Error("options.length must be a positive, non-zero integer");
  }
  if (typeof _options.segments !== "number" || !Number.isInteger(_options.segments) || _options.segments < 1) {
    throw new Error("options.segments must be a positive, non-zero integer");
  }
  if (_options.segments > _options.length) {
    throw new Error("options.segments must not be greater than options.length");
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

  // Distribute the characters as evenly as possible across the segments,
  // with the remainder spread one character at a time over the leading ones.
  const base_segment_size = Math.floor(_options.length / _options.segments);
  const num_longer_segments = _options.length % _options.segments;
  let segment_size = base_segment_size + (num_longer_segments > 0 ? 1 : 0);

  // This only matters when the segments join into something that could still
  // be read as a single number. A lone separator can be part of one: '.' as
  // the decimal point, '-' or '+' as the sign of the exponent. Two or more
  // separators cannot, unless they are empty and leave the characters running
  // together like an unsegmented id.
  const check_exponent = _options.segments < 3 || _options.separator === '';

  while (num_picked < _options.length) {
    const current_set = charsets[0];
    const next_char = pickRandomChar(current_set);

    // No two of the same in a row
    if (next_char !== prev_picked) {
      const char_position = num_picked;
      segment.push(next_char);
      prev_picked = next_char;
      num_picked += 1;
      num_from_set += 1;

      if (segment.length === segment_size) {
        picked.push(segment.join(''));
        segment = [];
        segment_size = base_segment_size + (picked.length < num_longer_segments ? 1 : 0);
      }

      // Track how many Es and non-E letters have been used so we can ensure
      // the output does not resemble exponential notation. Only characters
      // that were kept count: a rejected duplicate never appears in the id.
      if (check_exponent && current_set === LETTERS) {
        num_letters += 1;
        if (next_char === "E") {
          num_es += 1;
          if (num_es > 1) {
            is_exponent_safe = true;
          } else if (
            num_letters < 2 // Only one letter, which is this E
            && char_position > 0 // Not the first
            && char_position < _options.length - 1 // Not the last
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

      // With only one character left and no second letter yet, that character
      // has to be a letter, so never switch away from them at that point.
      const must_stay_on_letters = !is_exponent_safe
        && current_set === LETTERS
        && num_picked === _options.length - 1;

      // No more than 2 letters in a row to avoid forming words,
      // no more than 4 numbers in a row for easier memorization or conveyance
      // (the letters punctuate the number groups).
      if (
        !must_stay_on_letters
        && (
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
