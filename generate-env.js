// This script generates environment.generated.ts from system environment variables.
// Usage: node generate-env.js

var fs = require('fs');
var path = require('path');

var envPath = path.join(__dirname, 'src/environments/environment.generated.ts');
var THRESHOLD_SECONDS = 60; // Regenerate if older than 60 seconds

function shouldRegenerate(filePath, thresholdSeconds) {
  if (!fs.existsSync(filePath)) return true;
  var stats = fs.statSync(filePath);
  var now = Date.now();
  var mtime = new Date(stats.mtime).getTime();
  return (now - mtime) / 1000 > thresholdSeconds;
}

if (shouldRegenerate(envPath, THRESHOLD_SECONDS)) {
  var version = process.env.APP_VERSION || '';
  var releaseDate = process.env.APP_RELEASE_DATE || '';
  var commitHash = process.env.APP_COMMIT_HASH || '';
  var environment = process.env.ENVIRONMENT || 'development';
  var production = environment === 'production';
  var apiBaseUrlIos = process.env.API_BASE_URL_IOS || '';

  var content =
    'export const environment = {\n' +
    '  production: ' +
    production +
    ',\n' +
    "  version: '" +
    version +
    "',\n" +
    "  releaseDate: '" +
    releaseDate +
    "',\n" +
    "  commitHash: '" +
    commitHash +
    "',\n" +
    "  apiBaseUrlIos: '" +
    apiBaseUrlIos +
    "'\n" +
    '};\n';

  fs.writeFileSync(envPath, content);
  console.log('Generated src/environments/environment.generated.ts');
} else {
  console.log('environment.generated.ts is recent; skipping regeneration.');
}
