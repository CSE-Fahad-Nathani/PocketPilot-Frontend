const isProd = import.meta.env.VITE_PROD === "true";

const API_URL = isProd
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_LOCAL;

export { isProd };
export default API_URL;
