'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getToken } from '@/lib/auth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-blue-900">Gestor de presupuesto</h1>
        <p className="text-lg text-blue-800/80">
          Controla tu balance, añade ingresos y gastos, y aparta dinero para metas y ahorros.
        </p>
      </div>

      {loggedIn ? (
        <Card title="Inicio">
          <p className="text-slate-700 mb-4">Bienvenido de nuevo. Entra al panel para ver tu balance y actividad.</p>
          <Link href="/dashboard"><Button className="rounded-xl">Ir al panel</Button></Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Comenzar">
            <p className="text-slate-700 mb-4">Crea una cuenta o inicia sesión para gestionar tu presupuesto.</p>
            <Link href="/register"><Button className="rounded-xl">Registrarse</Button></Link>
            <Link href="/login"><Button variant="secondary" className="ml-2 rounded-xl">Iniciar sesión</Button></Link>
          </Card>
          <Card title="Funciones">
            <ul className="text-slate-700 space-y-1 list-disc list-inside">
              <li>Ver tu balance (ingresos/gastos)</li>
              <li>Añadir ingresos y gastos con descripción</li>
              <li>Metas de ahorro con objetivo</li>
              <li>Apartar dinero en huchas de ahorro</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
