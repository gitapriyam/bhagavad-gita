# Set release date and commit hash
source ./.env
export APP_VERSION=$(node -p "require('./package.json').version")
export APP_RELEASE_DATE="$(date +"%Y-%m-%d %H:%M:%S")"
export APP_COMMIT_HASH=$(git rev-parse --short HEAD)

if [ "$ENVIRONMENT" == "development" ]; then
  export API_BASE_URL_IOS=$AZURE_STATIC_WEB_APPS_URL_DEV
else
  export API_BASE_URL_IOS=$AZURE_STATIC_WEB_APPS_URL_PROD
fi
node generate-env.js