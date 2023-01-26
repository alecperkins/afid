
let num_pass = 0;
const errors = [];
let current_suite = '';


global.It = function It (name) {
  current_suite = `It ${name}`;
}

global.assert = function assert (condition, msg) {
  if (condition) {
    num_pass += 1;
  } else {
    errors.push(`${ current_suite }: ${ msg }`);
  }
}


require('../tests/afid.tests');

console.log({ num_pass, num_fail: errors.length, errors });
process.exit(errors.length > 0 ? 1 : 0);
