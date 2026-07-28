const isProd = import.meta.env.VITE_PROD === "true";

const API_URL = isProd
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_LOCAL;

/** Origin used to ping Render (root health), without `/api`. */
export const getServerOrigin = () => {
  const base = String(API_URL || "").replace(/\/api\/?$/, "");
  return base || "http://localhost:5000";
};

export { isProd };
export default API_URL;
