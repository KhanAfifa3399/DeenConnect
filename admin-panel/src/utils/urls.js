export function getFileUrl(path) {
  if (!path) return '';
  return `http://localhost:5000${path}`;
}