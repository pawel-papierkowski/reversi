import { version } from '../../package.json';

/** Environment variables for DEV environment. */
export const environment = {
  production: false,
  version: version, // updates version automatically from package.json
};
