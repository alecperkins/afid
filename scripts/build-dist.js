
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');


const PROJECT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(PROJECT_DIR, 'build');
const DIST_DIR = path.join(PROJECT_DIR, 'dist');
const PACKAGE_DIR = path.join(DIST_DIR, 'afid');

function readProjectFile (filepath) {
  return fs.readFileSync(path.join(PROJECT_DIR, filepath));
}
function readBuildFile (filepath) {
  return fs.readFileSync(path.join(BUILD_DIR, filepath));
}


function prepareDir () {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR);
  fs.mkdirSync(PACKAGE_DIR);
}

function writePackageFile (name, content) {
  console.log('writing',name);
  fs.writeFileSync(
    path.join(PACKAGE_DIR, name),
    content,
  );
}


function minify (header, code) {
  const result = UglifyJS.minify({ 'file1.js': code.toString() }, {
    mangle: true,
    toplevel: true,
    compress: {
      passes: 2,
    },
    output: {
      preamble: header,
    },
  });
  if (result.error) {
    throw result.error;
  }
  if (result.warnings) {
    result.warnings.forEach(warning => {
      console.warn(warning);
    });
  }
  return result.code;
}

function browserify (header, code) {
  return `${header}
;window.afid = (function (exports) {
${ code }
exports["version"] = "${ package_content.version }";
Object.assign(afid, exports);
return afid;
})({});
`;
}

function libify (header, code) {
  return `${ header }
${ code }
exports["version"] = "${ package_content.version }";
Object.assign(afid, exports);
module.exports = afid;`;
}

const package_content = require(path.join(__dirname, '..', 'package.json'));
delete package_content.scripts;
delete package_content.devDependencies;
delete package_content.private;
delete package_content.engines;

const header = `/* ${ package_content.name }@${ package_content.version } ${ package_content.license } ${ package_content.homepage } */`;

prepareDir();

writePackageFile('package.json', JSON.stringify(package_content, null, 4));
// writePackageFile('CHANGELOG.md', readProjectFile('CHANGELOG.md'));
writePackageFile('README.md', readProjectFile('README.md'));
writePackageFile('LICENSE', readProjectFile('LICENSE'));

const lib_content = readBuildFile('index.js');
writePackageFile('index.js', libify(header, lib_content));
writePackageFile('afid.js', browserify(header, lib_content));
writePackageFile('afid.min.js', minify(header, browserify('', lib_content)));

writePackageFile('index.d.ts', readBuildFile('index.d.ts'));
