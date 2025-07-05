// This script generates environment.generated.ts from system environment variables.
// Usage: node generate-env.js

var fs = require('fs');
var path = require('path');

var envPath = path.join(__dirname, 'src/environments/environment.generated.ts');

var version = process.env.APP_VERSION || '';
var releaseDate = process.env.APP_RELEASE_DATE || '';
var commitHash = process.env.APP_COMMIT_HASH || '';
var environment = process.env.ENVIRONMENT || 'development';
var production = environment === 'production';

var content =
  'export const environment = {\n' +
  '  production: ' + production + ',\n' +
  "  version: '" + version + "',\n" +
  "  releaseDate: '" + releaseDate + "',\n" +
  "  commitHash: '" + commitHash + "'\n" +
  '};\n';

fs.writeFileSync(envPath, content);
console.log('Generated src/environments/environment.generated.ts');
