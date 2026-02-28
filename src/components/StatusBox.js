export default function StatusBox({ loading, error, success }) {
  if (loading) return <p className="p-2 rounded-xl bg-blue-100 text-blue-800">Cargando…</p>;
  if (error) return <p className="p-2 rounded-xl bg-red-100 text-red-800">❌ {error}</p>;
  if (success) return <p className="p-2 rounded-xl bg-green-100 text-green-800">✅ {success}</p>;
  return null;
}