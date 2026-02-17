import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Esto autoriza a tu IP local a comunicarse con el servidor de la IA
    allowedDevOrigins: ["http://192.168.1.15:3000", "localhost:3000"],
  },
  // Opcional: Ayuda a que las peticiones de la IA no se disparen doble
  reactStrictMode: false,
};

export default nextConfig;