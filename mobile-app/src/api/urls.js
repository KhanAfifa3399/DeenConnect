import { API_BASE_URL } from '../constants/config';

export function getFileUrl(path) {
  if (!path) return null;
  const origin = API_BASE_URL.replace('/api', '');
  return `${origin}${path}`;
}