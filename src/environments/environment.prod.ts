import { version } from '../../package.json';

/** Environment variables for PROD environment. */
export const environment = {
  production: true,
  version: version, // updates version automatically from package.json
};
