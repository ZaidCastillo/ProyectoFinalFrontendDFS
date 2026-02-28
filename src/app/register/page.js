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

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = getToken();
    if (token) router.replace('/dashboard');
  }, [router]);

  const register = async (ev) => {
    ev.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !username.trim() || !password) {
      setError('Correo, usuario y contraseña son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error al registrarse');
        return;
      }
      setToken(data.token);
      setSuccess('Cuenta creada. Redirigiendo al panel…');
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
      <Card title="Crear cuenta">
        <form onSubmit={register} className="space-y-4">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </Button>
        </form>
        <div className="mt-4">
          <StatusBox loading={loading} error={error} success={success} />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
        </p>
      </Card>
    </main>
  );
}
