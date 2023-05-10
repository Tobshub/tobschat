export const server_url = import.meta.env.PROD ? "https://tobschat-api.onrender.com" : `http://${window.location.hostname}:4000`;
export const img_server_url = import.meta.env.PROD ? "" : `http://${window.location.hostname}:4001`;

