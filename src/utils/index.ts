export { API } from './API';

export function setExpiration() {
  const time = new Date().getTime();
  const expiration = 3600 * 2 * 1000; // +2 hours
  return time + expiration;
}