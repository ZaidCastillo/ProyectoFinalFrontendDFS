export default function Card({ title, children, className = '' }) {
  return (
    <section className={`bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {title ? (
        <div className="px-5 py-4 border-b border-blue-100 bg-blue-50/50">
          <h2 className="font-semibold text-blue-900">{title}</h2>
        </div>
      ) : null}

      <div className="px-5 py-4">
        {children}
      </div>
    </section>
  );
}
