export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
