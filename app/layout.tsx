import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import { Navegacion } from '@/components/Navegacion';
import './globals.css';

// Una sola familia para toda la app. El eje de ancho (wdth) es el que usa
// `.expandida`, reservado para el número grande de la cuenta regresiva.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'norte',
  description: 'A qué hora tengo que salir.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={archivo.variable}>
      <body className="min-h-dvh font-sans antialiased">
        {/* El padding de abajo deja pasar la barra fija sin tapar contenido. */}
        <main className="mx-auto w-full max-w-md px-5 pb-28 pt-6">{children}</main>
        <Navegacion />
      </body>
    </html>
  );
}
