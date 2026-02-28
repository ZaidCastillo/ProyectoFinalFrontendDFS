'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API } from '@/config';
import { getToken, setToken } from '@/lib/auth';
import StatusBox from '@/components/StatusBox';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = getToken();
    if (token) router.replace('/dashboard');
  }, [router]);

  const login = async (ev) => {
    ev.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas');
        return;
      }
      setToken(data.token);
      setSuccess('Sesión iniciada. Redirigiendo al panel…');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Error de red o API no disponible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <Card title="Iniciar sesión">
        <form onSubmit={login} className="space-y-4">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4">
          <StatusBox loading={loading} error={error} success={success} />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          ¿No tienes cuenta? <Link href="/register" className="text-blue-600 hover:underline">Regístrate</Link>
        </p>
      </Card>
    </main>
  );
}
