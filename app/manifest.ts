import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SGI Opera Soluciones',
    short_name: 'SGI App',
    description: 'Sistema de Gestión Integral - App de Autorreporte y Seguimiento',
    start_url: '/autorreporte',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a73e8',
    orientation: 'portrait',
    icons: [
      {
        src: '/recursos/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/recursos/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/recursos/logopera.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
  };
}
