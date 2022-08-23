export { API } from './API';

export function setExpiration() {
  const time = new Date().getTime();
  const expiration = 3600 * 3 * 1000; // + three hours
  return time + expiration;
}