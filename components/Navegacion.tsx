'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Cuatro secciones y nada más. Cada paso del plan llena la suya.
const SECCIONES = [
  { href: '/', nombre: 'Hoy' },
  { href: '/rachas', nombre: 'Rachas' },
  { href: '/metas', nombre: 'Metas' },
  { href: '/plata', nombre: 'Plata' },
] as const;

/**
 * Barra fija abajo: todo alcanzable con el pulgar.
 *
 * Sin iconos. El peso y el color hacen la jerarquía, igual que en el resto de
 * la app, y así no entra una familia de iconos por la puerta de atrás.
 */
export function Navegacion() {
  const ruta = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 border-t border-bruma bg-marea pb-[env(safe-area-inset-bottom)]"
      aria-label="Secciones"
    >
      <ul className="mx-auto flex w-full max-w-md">
        {SECCIONES.map(({ href, nombre }) => {
          const activa = ruta === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={activa ? 'page' : undefined}
                className={`flex min-h-14 items-center justify-center text-sm ${
                  activa ? 'font-semibold text-espuma' : 'text-niebla'
                }`}
              >
                {nombre}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
