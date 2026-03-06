import secureStorage from '../secureStorage';

export default () => {
  const storedToken = secureStorage.getItem('cube:token');

  if (storedToken) {
    const token = JSON.parse(storedToken);
    const created = Math.round(token.created / 1000);
    const ttl = token.expires_in;
    const expiry = created + ttl;

    if (Math.round(Date.now() / 1000) > expiry) return false;

    return true;
  }

  return false;
};
