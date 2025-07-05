#!/bin/bash

# Default values for environment and action
ENVIRONMENT=${1:-local} # Default to 'local' if no environment is specified
ACTION=${2:-start}      # Default to 'start' if no action is specified

echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"

export API_LOCATION="api"
export APP_LOCATION="src"
export OUTPUT_LOCATION="dist/bhagavad-gita/browser"

# Run unit tests before building
npm run test
TEST_RESULT=$?
if [ "$TEST_RESULT" -ne 0 ]; then
  echo "Frontend unit tests failed. Aborting build and SWA start/deploy."
  exit 1
fi

# Run API (backend) unit tests
cd $API_LOCATION
if [ -f package.json ]; then
  if npm run | grep -q "test"; then
    echo "Running API unit tests..."
    npm run test
    API_TEST_RESULT=$?
    if [ $API_TEST_RESULT -ne 0 ]; then
      echo "API unit tests failed. Aborting build and SWA start/deploy."
      exit 1
    fi
  else
    echo "No API unit test script found in $API_LOCATION/package.json. Skipping API tests."
  fi
else
  echo "No package.json found in $API_LOCATION. Skipping API tests."
fi
cd -

# Build the frontend application
echo "Building frontend application..."
# Using --legacy-peer-deps to bypass peer dependency conflicts during installation.
# This is a temporary workaround; resolving these conflicts is recommended in the future.
npm install -legacy-peer-deps

# Set release date and commit hash
export APP_VERSION=$(node -p "require('./package.json').version")
export APP_RELEASE_DATE="$(date +"%Y-%m-%d %H:%M:%S")"
export APP_COMMIT_HASH=$(git rev-parse --short HEAD)

node generate-env.js

if [ "$ENVIRONMENT" == "development" ]; then
  echo "Building in development mode..."
  npx ng build --configuration=development
else
  echo "Building in production mode..."
  npx ng build --configuration=production
fi

# Install production dependencies for the API
echo "Installing production dependencies for the API..."
cd $API_LOCATION
echo "Current directory: $(pwd)"
npm install --production
cd -

# Deploy or start the Static Web App based on the action
if [ "$ACTION" == "start" ]; then
  echo "Starting SWA in environment: $ENVIRONMENT"
  # Start the SWA CLI
  npx swa start \
    --config swa-cli.config.json \
    --config-name $ENVIRONMENT \
    --app-location $OUTPUT_LOCATION  \
    --api-location $API_LOCATION \
    --output-location $OUTPUT_LOCATION \
    --devserver-timeout 120
else
  # Load environment variables from .env file
  source .env

  echo "Deploying to environment: $ENVIRONMENT"
  npx swa --verbose=silly deploy \
    --config swa-cli.config.json \
    --app-location $APP_LOCATION \
    --api-location $API_LOCATION \
    --config-name $ENVIRONMENT \
    --output-location $OUTPUT_LOCATION \
    --env $ENVIRONMENT \
    --deployment-token $AZURE_STATIC_WEB_APPS_API_TOKEN \
    --app-name gita-app-rg/bhagavad-gita \
    --swa-config-location src \
    --api-language node \
    --api-version 20
fi