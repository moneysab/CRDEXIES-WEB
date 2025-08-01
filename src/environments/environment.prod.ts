import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'http://ec2-13-39-196-2.eu-west-3.compute.amazonaws.com:8080',
  epinApiUrl: 'http://ec2-52-47-41-115.eu-west-3.compute.amazonaws.com:8080/cardexis-settlement',
};
