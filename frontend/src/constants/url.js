const buildBrowserApiUrl = () => {
  if (typeof window === 'undefined' || !window.location) {
    return null;
  }

  const protocol = window.location.protocol || 'http:';
  const hostname = window.location.hostname || 'localhost';
  const port = 4000;
  return `${protocol}//${hostname}:${port}/`;
};

const normalizeUrl = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.href.endsWith('/') ? url.href : `${url.href}/`;
  } catch {
    return null;
  }
};

const envApiUrl = normalizeUrl(process.env.REACT_APP_API_URL);
const browserApiUrl = buildBrowserApiUrl();

const getFinalApiUrl = () => {
  if (!envApiUrl) {
    return browserApiUrl || 'http://localhost:4000/';
  }

  if (!browserApiUrl) {
    return envApiUrl;
  }

  try {
    const envUrl = new URL(envApiUrl);
    const browserUrl = new URL(browserApiUrl);
    const differentHost = envUrl.hostname !== browserUrl.hostname;
    const differentPort = envUrl.port !== browserUrl.port;

    if (differentHost && browserUrl.hostname && browserUrl.hostname !== 'localhost') {
      console.warn(
        'REACT_APP_API_URL host difiere de la red actual. Usando la dirección del navegador para la API.'
      );
      return browserApiUrl;
    }
  } catch (err) {
    // Mantener la URL del entorno si no podemos comparar correctamente.
  }

  return envApiUrl;
};

export const API_URL = getFinalApiUrl();