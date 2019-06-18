const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const shelljs = require('shelljs');
const chalk = require('chalk');
const sass = require('node-sass');
const packageImporter = require('node-sass-package-importer');

let libName = argv['lib'],
  libPath = '',
  libVers = '',
  libInfo = '',
  libGlobalName = '',
  libInfoFilePath = '',
  libDistPath = '';

function doBuild() {
  if (!libName || typeof libName !== 'string') {
    throw new Error('--lib 参数值不能为空.');
  }

  libPath = path.join(__dirname, 'lib', libName);
  libInfoFilePath = path.join(libPath, 'lib-info.json');
  libDistPath = path.join(__dirname, '../static-src/fe-core/lib/', libName);

  if (!fs.existsSync(libPath)) {
    throw new Error('指定的类库目录不存在.');
  } else if (!fs.existsSync(libInfoFilePath)) {
    throw new Error('指定类库目录下不存在 lib-info.json 配置文件.');
  } else {
    libInfo = require(libInfoFilePath);
  }

  if (libInfo['version']) {
    libVers = libInfo['version'];
  } else {
    throw new Error('lib-info.json 的 version 配置不能为空.');
  }

  if (libInfo['global-name']) {
    libGlobalName = libInfo['global-name'];
  } else {
    libGlobalName = libName;
  }

  if (!/\d+\.\d+\.\d+/.test(libVers)) {
    throw new Error('version 参数值不符合规范');
  }

  let currDistFilePath = path.join(libDistPath, `${libName}-v${libVers}.js`);
  if (fs.existsSync(currDistFilePath)) {
    libVers = getNewVers(libVers);
    let msg = [`${currDistFilePath} 文件已经存在`, `版本号自动自增为 ${libVers}`];
    if (libInfo) {
      libInfo.version = libVers;
      writeVersToJSONFile(libInfoFilePath);
      msg.push('新的版本号已写入 lib-info.json');
    }
    console.log(chalk.green(msg.join('\n')));
  }

  process.env.libGlobalName = libGlobalName;
  process.env.libName = libName;
  process.env.libVers = libVers;
  process.env.libDistPath = libDistPath;

  doBuildJS();
  doBuildSCSS();
}

function doBuildSCSS() {
  let scssFiles = fs.readdirSync(libPath).filter(file => {
    return /\.scss$/.test(file);
  });

  scssFiles.forEach(file => {
    let fileName = file.replace(/\.scss/, '') + `-v${libVers}.css`,
      filePath = path.join(libPath, file),
      distFilePath = path.join(libDistPath, fileName);

    let css = sass.renderSync({
      outputStyle: 'compressed',
      file: filePath,
      importer: packageImporter(),
    });
    fs.writeFileSync(distFilePath, css.css);
  });

  if (scssFiles.length > 0) {
    console.log(chalk.green('Build the css file successfully.'));
  }
}

function doBuildJS() {
  let code = shelljs.exec('npm run prod').code;
  if (code === 0) {
    console.log(chalk.green('Build the js file successfully.'));
  } else {
    throw new Error('Failed to build the js file.');
  }
}

function writeVersToJSONFile(libInfoFilePath) {
  let json = JSON.stringify(libInfo, null, 4);
  fs.writeFileSync(libInfoFilePath, json, 'utf8');
}

function getNewVers(vers) {
  let versArray = vers.split('.');
  versArray[2] = parseInt(versArray[2]) + 1;

  let newVers = versArray.join('.'),
    newDistFilePath = path.join(libDistPath, `${libName}-v${newVers}.js`);
  if (fs.existsSync(newDistFilePath)) {
    return getNewVers(newVers);
  } else {
    return versArray.join('.');
  }
}

try {
  doBuild();
} catch (e) {
  let errMsg = [
    e.message,
    '举例: node monkey.js --lib mshare',
    '查看当前目录下的 README.md 了解如何配置 lib-info.json',
  ].join('\n');
  console.log(chalk.red(errMsg));
}
