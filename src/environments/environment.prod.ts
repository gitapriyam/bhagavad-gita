import { baseEnvironment } from './base-environment'; // Import the base environment

export const environment = {
  ...baseEnvironment,
  production: true,
  logLevel: 'error', // Set the log level for production
};
