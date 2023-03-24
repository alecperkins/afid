import afid from "afid";

const id = afid({ length: 8 }); // Specifies the option arg to confirm the types allow for optional options.
if (!id || id.length !== 8) {
  throw new Error('Missing id');
}
console.log(afid.version, 'typescript', id);
