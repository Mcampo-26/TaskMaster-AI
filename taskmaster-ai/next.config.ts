import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Eliminamos allowedDevOrigins porque Vercel no lo reconoce 
     y causa el error en el despliegue.
  */
  experimental: {}, 
  
  // Mantenemos esto para evitar comportamientos dobles en el renderizado
  reactStrictMode: false,
};

export default nextConfig;