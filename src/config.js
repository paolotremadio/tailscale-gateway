/* eslint import/no-dynamic-require: 0 */
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const configPath = path.resolve(path.join(cwd, 'config.js'));

console.log(`Current working directory: ${cwd}`);
console.log(`📄 Loading config from: ${configPath}`);

if (!fs.existsSync(configPath)) {
  console.error(`Config "${configPath}" does not exist!`);
  process.exit(1);
}

module.exports = require(configPath);
