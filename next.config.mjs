/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Pages no soporta el optimizador de imagenes de Next por
    // defecto sin configuracion adicional; se deja sin optimizar para
    // simplicidad inicial.
    unoptimized: true,
  },
};

export default nextConfig;
