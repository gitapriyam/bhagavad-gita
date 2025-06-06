import { baseEnvironment } from './base-environment';

export const environment = {
  ...baseEnvironment,
  production: false,
  logLevel: 'debug', // Set the log level for development
};
