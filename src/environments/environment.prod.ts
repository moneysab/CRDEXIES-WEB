import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'http://84.234.31.171:8080',
  epinApiUrl: 'http://84.234.31.171:8080/cardexis-settlement',
};
