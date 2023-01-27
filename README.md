
# afid: AFfordance’d IDentifiers

[![npm package](https://img.shields.io/npm/v/afid)](https://www.npmjs.com/package/afid) [![MIT license](https://img.shields.io/npm/l/afid)](https://github.com/alecperkins/afid/blob/main/LICENSE) [![test status](https://github.com/alecperkins/afid/actions/workflows/test/badge.svg)](https://github.com/alecperkins/afid/actions/workflows/test.yml)

`afid()` generates small random strings intended to be used as identifiers that are human friendly, with affordances for reading the identifier in a list or exchanging it verbally. The identifiers are short, omit certain characters that are easily confused, and avoid forming words (no [problem #3,735,928,559](https://3735928559.xyz)).

They are useful for situations that typically use sequential numbers but in scenarios where that is not desired. Use cases include: invoice numbers that don’t reveal the count of invoices; transaction reference keys. They are especially helpful for sets that, when sorted by this identifier, benefit from visual distinction and quick random access. At the default length, the number of possible ids is well into the billions. This is suitable for many usecases but not for large or distributed data sets.

Note: `afid` does not use a secure random generator, and the identifiers are intentionally very short. Do not assume they are globally unique or unguessable! Also note that they are not lexigraphically sortable.


## Afid anatomy

A sample of some ids:

```
JU7894XR
K89RD234
Y3724QR6
3638J378
```

Shorter or longer ids can be generated, though beyond 10 or 12 characters they lose ease-of-use:

```
2U787
GM932AE2
46RF3DR434R
AK26VG8V8469
H7489DU4786V
2DQ8484X24JG
PW2324HW3937FX8A9K8NK32T
3464HM9473WR8794XK2829GN
```

### Afid Characteristics

- short, default length is 8 characters
- omits certain ambiguous characters (`I`,`1`,`O`,`0`,`Z`,`B`)
  - `L` is omitted since it looks like 1 if the id is displayed in lowercase
- never has more than two letters or four numbers in a row
  - avoids forming words
  - uses the letters to punctuate the number groups
- encodes no information


## Installation

`npm install --save afid`

and include as a JavaScript or TypeScript module (types included):

```typescript
import afid from 'afid';
```

…or a CommonJS module:

```javascript
const afid = require('afid');
```

Or use the file directly in markup via the [unpkg CDN](https://unpkg.com/):

```html
<script src="https://unpkg.com/afid"></script>
<script>
  const id = window.afid();
  …
</script>
```


## Usage

Call to get an eight character long identifier.

```javascript
const id = afid();
// id === 'CJ6376A8';
```

Optionally specify a different length. _Keep in mind: the number of possible identifiers decreases rapidly as it gets shorter; the usefulness for humans gets worse as it gets longer._

```javascript
const id = afid(6);
// id === '27UV3K';
```
```javascript
const id = afid(12);
// id === 'K4XH984DE486';
```


### Set a prefix or suffix

```javascript
const id = afid({ prefix: "CLIENT-" });
// id === "CLIENT-9KW42HU2"
```
```javascript
const id = afid({ suffix: "WEB" });
// id === "G3QT9D2KWEB"
```


## Author

Alec Perkins, https://alecperkins.net


## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).

See `./LICENSE` for more information.
