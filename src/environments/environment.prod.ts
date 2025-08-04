import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'https://c-bill-api.moneysab.fr',
  epinApiUrl: 'http://84.234.31.171:8082/cardexis-settlement',
};
