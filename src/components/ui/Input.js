export default function Input({ className = '', ...props }) {
  return (
    <input
      className={[
        'w-full px-3 py-2 rounded-xl border border-blue-200 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
        className
      ].join(' ')}
      {...props}
    />
  );
}
