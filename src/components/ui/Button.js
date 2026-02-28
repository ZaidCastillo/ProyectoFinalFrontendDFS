export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
