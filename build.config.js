const path = require('path');

const libGlobalName = process.env.libGlobalName;
const libName = process.env.libName;
const libVers = process.env.libVers;
const libDistPath = process.env.libDistPath;
const entryFilePath = path.join(__dirname, 'lib', libName, 'index.js');

let config = {
  projectRelativePath: libName,
  injectAllFiles: false,
  entry: {},
  staticPublicProjectPath: libDistPath,
  sourceMap: false,
  outputNamingPattern: 'fixed',
  injectStylesFiles: false,
  injectScriptsFiles: false,
  library: libGlobalName,
};
config.entry[`${libName}-v${libVers}`] = entryFilePath;

module.exports = config;
