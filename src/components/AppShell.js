import Navbar from "./Navbar";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50/50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 w-full">
        {children}
      </main>
      <footer className="bg-white border-t border-blue-100 text-center py-4 mt-auto rounded-t-2xl shadow-sm">
        <p className="text-blue-800/80 text-sm">&copy; 2026 Gestor de presupuesto. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
