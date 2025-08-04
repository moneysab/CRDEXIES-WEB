import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: '',
  epinApiUrl: 'http://84.234.31.171:8082/cardexis-settlement',
};
