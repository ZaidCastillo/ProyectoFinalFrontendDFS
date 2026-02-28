'use client';

import { useState, useEffect } from 'react';
import { API } from '@/config';
import { apiFetch } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBox from '@/components/StatusBox';

const CURRENCY_LABELS = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', JPY: 'JPY', CAD: 'CAD', AUD: 'AUD', CHF: 'CHF', CNY: 'CNY' };

function formatInCurrency(amount, currency) {
  const n = Number(amount);
  if (currency === 'USD') return `$${n.toFixed(2)}`;
  return `${currency} ${n.toFixed(2)}`;
}

export default function TransactionsPage() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [rates, setRates] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load(pageNum = 1) {
    setLoading(true);
    setError('');
    try {
      const [balanceRes, txRes] = await Promise.all([
        apiFetch('/transactions/balance'),
        apiFetch(`/transactions?page=${pageNum}&limit=10`),
      ]);
      setBalance(balanceRes.balance);
      setTransactions(txRes.data ?? []);
      setTotalPages(txRes.totalPages ?? 1);
    } catch (err) {
      setError(err.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
  }, [page]);

  useEffect(() => {
    if (!API) return;
    let cancelled = false;
    fetch(`${API}/exchange-rates?base=USD`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.conversion_rates) setRates(data.conversion_rates);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setSubmitError('El importe debe ser un número positivo');
      return;
    }
    setSubmitLoading(true);
    try {
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type,
          amount: num,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        }),
      });
      setSubmitSuccess('Transacción añadida');
      setAmount('');
      setReason('');
      setFormOpen(false);
      load(page);
    } catch (err) {
      setSubmitError(err.message || 'Error al añadir la transacción');
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) return <p className="text-blue-800">Cargando…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const rate = (rates && currency !== 'USD' && rates[currency]) ? rates[currency] : 1;
  const convert = (amount) => Number(amount) * rate;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-900">Transacciones</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {rates && (
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-blue-900 focus:ring-2 focus:ring-blue-400"
            >
              {Object.entries(CURRENCY_LABELS).map(([code]) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          )}
          <span className="text-lg font-semibold text-blue-700">
            Balance: {formatInCurrency(convert(balance), currency)}
          </span>
          <Button onClick={() => setFormOpen(!formOpen)} className="rounded-xl">
            {formOpen ? 'Cancelar' : 'Añadir ingreso / gasto'}
          </Button>
        </div>
      </div>

      {formOpen && (
        <Card title="Añadir transacción">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-400"
              >
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Importe</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
              <Input
                placeholder='Dejar en blanco para "General"'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitLoading} className="rounded-xl">
              {submitLoading ? 'Añadiendo…' : 'Añadir'}
            </Button>
          </form>
          <StatusBox loading={submitLoading} error={submitError} success={submitSuccess} />
        </Card>
      )}

      <Card title="Todas las transacciones">
        {transactions.length === 0 ? (
          <p className="text-slate-600">Aún no hay transacciones. Añade tu primer ingreso o gasto arriba.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {transactions.map((t) => (
                <li key={t.id} className="flex flex-wrap justify-between items-center py-2 border-b border-blue-100 last:border-0">
                  <span className={t.type === 'income' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                    {t.type === 'income' ? '+' : '−'} {formatInCurrency(convert(t.amount), currency)}
                  </span>
                  <span className="text-slate-700 flex-1 mx-2">{t.reason}</span>
                  <span className="text-slate-500 text-sm">{t.transaction_date}</span>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between border-t border-blue-100 pt-3">
                <Button variant="secondary" className="rounded-xl" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Anterior
                </Button>
                <span className="text-sm text-slate-600">Página {page} de {totalPages}</span>
                <Button variant="secondary" className="rounded-xl" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
