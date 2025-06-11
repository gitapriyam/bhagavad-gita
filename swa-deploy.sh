#!/bin/bash

# Default values for environment and action
ENVIRONMENT=${1:-local} # Default to 'local' if no environment is specified
ACTION=${2:-start}      # Default to 'start' if no action is specified

echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"

export API_LOCATION="api"
export APP_LOCATION="src"
export OUTPUT_LOCATION="dist/bhagavad-gita/browser"

# Build the frontend application
echo "Building frontend application..."
# Using --legacy-peer-deps to bypass peer dependency conflicts during installation.
# This is a temporary workaround; resolving these conflicts is recommended in the future.
npm install -legacy-peer-deps
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