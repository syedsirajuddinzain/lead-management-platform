export function Input({ label, error, className = '', id, ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900
          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          ${error ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', id, rows = 4, ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900
          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          ${error ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', id, children, ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          ${error ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
