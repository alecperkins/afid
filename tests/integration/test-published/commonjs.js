const afid = require('afid');

const id = afid();
if (!id || id.length !== 8) {
  throw new Error('Missing id');
}
console.log(afid.version, 'commonjs', id);
