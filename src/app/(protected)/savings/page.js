'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBox from '@/components/StatusBox';

export default function SavingsPage() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [addToId, setAddToId] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  async function load() {
    try {
      const data = await apiFetch('/savings');
      setSavings(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los ahorros');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(ev) {
    ev.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    const num = amount === '' ? 0 : Number(amount);
    if (!name.trim()) {
      setSubmitError('El nombre es obligatorio');
      return;
    }
    if (!Number.isFinite(num) || num < 0) {
      setSubmitError('El importe debe ser un número mayor o igual a 0');
      return;
    }
    setSubmitLoading(true);
    try {
      await apiFetch('/savings', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), amount: num }),
      });
      setSubmitSuccess('Hucha creada');
      setName('');
      setAmount('');
      setFormOpen(false);
      load();
    } catch (err) {
      setSubmitError(err.message || 'Error al crear');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleAddToSaving(ev, savingId) {
    ev.preventDefault();
    const num = Number(addAmount);
    if (!Number.isFinite(num) || num <= 0) return;
    try {
      await apiFetch(`/savings/${savingId}/add`, {
        method: 'POST',
        body: JSON.stringify({ amount: num }),
      });
      setAddToId(null);
      setAddAmount('');
      load();
    } catch (err) {
      setSubmitError(err.message || 'Error al añadir');
    }
  }

  if (loading) return <p className="text-blue-800">Cargando…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-900">Huchas de ahorro</h1>
        <Button onClick={() => setFormOpen(!formOpen)} className="rounded-xl">
          {formOpen ? 'Cancelar' : 'Nueva hucha'}
        </Button>
      </div>

      {formOpen && (
        <Card title="Crear hucha de ahorro">
          <p className="text-sm text-slate-600 mb-3">Aparta dinero en huchas con nombre (ej. Fondo de emergencia, Vacaciones).</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <Input placeholder="ej. Fondo de emergencia" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Importe inicial (opcional)</label>
              <Input type="number" step="0.01" min="0" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitLoading} className="rounded-xl">
              {submitLoading ? 'Creando…' : 'Crear hucha'}
            </Button>
          </form>
          <StatusBox loading={submitLoading} error={submitError} success={submitSuccess} />
        </Card>
      )}

      <Card title="Tus huchas">
        {savings.length === 0 ? (
          <p className="text-slate-600">Aún no hay huchas. Crea una para apartar dinero.</p>
        ) : (
          <ul className="space-y-4">
            {savings.map((s) => (
              <li key={s.id} className="border border-blue-100 rounded-xl p-4 bg-blue-50/30 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h3 className="font-semibold text-blue-900">{s.name}</h3>
                  <p className="text-lg font-medium text-blue-700">${Number(s.amount).toFixed(2)}</p>
                </div>
                {addToId === s.id ? (
                  <form onSubmit={(ev) => handleAddToSaving(ev, s.id)} className="flex items-center gap-2">
                    <Input type="number" step="0.01" min="0.01" placeholder="Importe" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="w-24" />
                    <Button type="submit" className="rounded-xl">Añadir</Button>
                    <Button type="button" variant="secondary" onClick={() => setAddToId(null)} className="rounded-xl">Cancelar</Button>
                  </form>
                ) : (
                  <Button variant="secondary" onClick={() => setAddToId(s.id)} className="rounded-xl">Añadir dinero</Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
