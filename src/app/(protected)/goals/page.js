'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBox from '@/components/StatusBox';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [addToId, setAddToId] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  async function load() {
    try {
      const data = await apiFetch('/goals');
      setGoals(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las metas');
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
    const num = Number(targetAmount);
    if (!name.trim()) {
      setSubmitError('El nombre de la meta es obligatorio');
      return;
    }
    if (!Number.isFinite(num) || num <= 0) {
      setSubmitError('El objetivo debe ser un número positivo');
      return;
    }
    setSubmitLoading(true);
    try {
      await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          target_amount: num,
          deadline: deadline || undefined,
        }),
      });
      setSubmitSuccess('Meta creada');
      setName('');
      setTargetAmount('');
      setDeadline('');
      setFormOpen(false);
      load();
    } catch (err) {
      setSubmitError(err.message || 'Error al crear la meta');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleAddToGoal(ev, goalId) {
    ev.preventDefault();
    const num = Number(addAmount);
    if (!Number.isFinite(num) || num <= 0) return;
    try {
      await apiFetch(`/goals/${goalId}/add`, {
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
        <h1 className="text-2xl font-bold text-blue-900">Metas de ahorro</h1>
        <Button onClick={() => setFormOpen(!formOpen)} className="rounded-xl">
          {formOpen ? 'Cancelar' : 'Nueva meta'}
        </Button>
      </div>

      {formOpen && (
        <Card title="Crear meta">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la meta</label>
              <Input placeholder="ej. Vacaciones" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo (importe)</label>
              <Input type="number" step="0.01" min="0.01" placeholder="0,00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha límite (opcional)</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitLoading} className="rounded-xl">
              {submitLoading ? 'Creando…' : 'Crear meta'}
            </Button>
          </form>
          <StatusBox loading={submitLoading} error={submitError} success={submitSuccess} />
        </Card>
      )}

      <Card title="Tus metas">
        {goals.length === 0 ? (
          <p className="text-slate-600">Aún no hay metas. Crea una para empezar a ahorrar.</p>
        ) : (
          <ul className="space-y-4">
            {goals.map((g) => {
              const current = Number(g.current_amount);
              const target = Number(g.target_amount);
              const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
              return (
                <li key={g.id} className="border border-blue-100 rounded-xl p-4 bg-blue-50/30">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-blue-900">{g.name}</h3>
                      <p className="text-sm text-slate-600">
                        ${current.toFixed(2)} / ${target.toFixed(2)} ({pct.toFixed(0)}%)
                      </p>
                      {g.deadline && <p className="text-xs text-slate-500">Para {g.deadline}</p>}
                    </div>
                    {addToId === g.id ? (
                      <form onSubmit={(ev) => handleAddToGoal(ev, g.id)} className="flex items-center gap-2">
                        <Input type="number" step="0.01" min="0.01" placeholder="Importe" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="w-24" />
                        <Button type="submit" className="rounded-xl">Añadir</Button>
                        <Button type="button" variant="secondary" onClick={() => setAddToId(null)} className="rounded-xl">Cancelar</Button>
                      </form>
                    ) : (
                      <Button variant="secondary" onClick={() => setAddToId(g.id)} className="rounded-xl">Añadir dinero</Button>
                    )}
                  </div>
                  <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
