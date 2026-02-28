'use client';

import { clearToken, getToken } from '@/lib/auth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-800' : 'text-blue-800 hover:bg-blue-50'}`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setTokenState] = useState(null);

  useEffect(() => {
    setTokenState(getToken());
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    setTokenState(null);
    router.replace('/login');
    router.refresh();
  };

  return (
    <header className="border-b border-blue-100 bg-white rounded-b-2xl shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link href="/" className="text-xl font-bold text-blue-700">
          Gestor de presupuesto
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink href="/">Inicio</NavLink>

          {token ? (
            <>
              <NavLink href="/dashboard">Panel</NavLink>
              <NavLink href="/transactions">Transacciones</NavLink>
              <NavLink href="/goals">Metas</NavLink>
              <NavLink href="/savings">Ahorros</NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login">Iniciar sesión</NavLink>
              <NavLink href="/register">Registrarse</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
