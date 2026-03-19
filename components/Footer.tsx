export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-green-600 flex items-center justify-center text-xs">
            🛒
          </div>
          <span className="text-xs font-semibold text-slate-500">SpesaSmart</span>
        </div>
        <p className="text-xs text-slate-400">© 2025 — Tutti i prezzi sono indicativi</p>
      </div>
    </footer>
  );
}
