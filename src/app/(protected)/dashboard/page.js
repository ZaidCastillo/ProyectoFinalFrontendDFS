'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API } from '@/config';
import { apiFetch } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const CURRENCY_LABELS = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', JPY: 'JPY', CAD: 'CAD', AUD: 'AUD', CHF: 'CHF', CNY: 'CNY' };

function formatInCurrency(amount, currency) {
  const n = Number(amount);
  if (currency === 'USD') return `$${n.toFixed(2)}`;
  return `${currency} ${n.toFixed(2)}`;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rates, setRates] = useState(null);
  const [currency, setCurrency] = useState('USD');

  const load = () => {
    setError('');
    setLoading(true);
    setBalance(null);
    (async function () {
      try {
        if (!API) {
          setError('Falta NEXT_PUBLIC_API_URL. Configúralo en .env con la URL del backend (ej. http://localhost:3000).');
          return;
        }
        const [balanceRes, txRes, goalsRes, savingsRes] = await Promise.all([
          apiFetch('/transactions/balance'),
          apiFetch('/transactions?limit=5'),
          apiFetch('/goals'),
          apiFetch('/savings'),
        ]);
        setBalance(balanceRes.balance);
        setTransactions(Array.isArray(txRes) ? txRes : (txRes?.data ?? []));
        setGoals(goalsRes);
        setSavings(savingsRes);
      } catch (err) {
        setError(err.message || 'Error al cargar el panel');
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    load();
  }, []);

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

  if (loading && balance === null && !error) return <p className="text-blue-800">Cargando…</p>;
  if (error) {
    const isConnectionError = /reach|backend|NEXT_PUBLIC|network|red|API/i.test(error);
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error}</p>
        {isConnectionError && (
          <p className="text-slate-600 text-sm">
            Comprueba que el backend esté en marcha en la URL de NEXT_PUBLIC_API_URL (ej. <code className="bg-slate-100 px-1 rounded">http://localhost:3000</code>).
          </p>
        )}
        <Button onClick={load} variant="secondary" className="rounded-xl">Reintentar</Button>
      </div>
    );
  }

  const totalSaved = savings.reduce((s, p) => s + Number(p.amount), 0);
  const goalsTotal = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  const rate = (rates && currency !== 'USD' && rates[currency]) ? rates[currency] : 1;
  const convert = (amount) => Number(amount) * rate;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-900">Panel</h1>
        {rates && (
          <div className="flex items-center gap-2">
            <label htmlFor="currency" className="text-sm text-slate-600">Ver en:</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-blue-900 focus:ring-2 focus:ring-blue-400"
            >
              {Object.entries(CURRENCY_LABELS).map(([code]) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Balance">
          <p className="text-2xl font-semibold text-blue-700">
            {formatInCurrency(convert(balance), currency)}
          </p>
          {currency !== 'USD' && rate !== 1 && (
            <p className="text-xs text-slate-500 mt-0.5">≈ ${Number(balance).toFixed(2)} USD</p>
          )}
          <p className="text-sm text-slate-600 mt-1">Ingresos − gastos</p>
          <Link href="/transactions" className="inline-block mt-2">
            <Button variant="secondary" className="rounded-xl">Ver transacciones</Button>
          </Link>
        </Card>
        <Card title="Huchas de ahorro">
          <p className="text-2xl font-semibold text-blue-700">
            {formatInCurrency(convert(totalSaved), currency)}
          </p>
          <p className="text-sm text-slate-600 mt-1">{savings.length} hucha(s)</p>
          <Link href="/savings" className="inline-block mt-2">
            <Button variant="secondary" className="rounded-xl">Gestionar ahorros</Button>
          </Link>
        </Card>
        <Card title="Metas">
          <p className="text-2xl font-semibold text-blue-700">
            {formatInCurrency(convert(goalsTotal), currency)} / {goals.length} meta(s)
          </p>
          <Link href="/goals" className="inline-block mt-2">
            <Button variant="secondary" className="rounded-xl">Ver metas</Button>
          </Link>
        </Card>
      </div>

      <Card title="Últimas transacciones">
        {transactions.length === 0 ? (
          <p className="text-slate-600">Aún no hay transacciones.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li key={t.id} className="flex justify-between items-center py-1 border-b border-blue-100 last:border-0">
                <span className={t.type === 'income' ? 'text-green-700' : 'text-red-700'}>
                  {t.type === 'income' ? '+' : '−'} {formatInCurrency(convert(t.amount), currency)}
                </span>
                <span className="text-slate-700">{t.reason}</span>
                <span className="text-slate-500 text-sm">{t.transaction_date}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/transactions" className="inline-block mt-3">
          <Button className="rounded-xl">Todas las transacciones</Button>
        </Link>
      </Card>
    </div>
  );
}
