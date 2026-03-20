export default function Footer() {
  return (
    <footer className="hidden lg:block border-t border-ink-faint/30 bg-surface-card py-4 mt-8">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-brand-900 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-brand-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-ink-secondary">SpesaSmart</span>
        </div>
        <p className="text-xs text-ink-tertiary">Tutti i prezzi sono indicativi</p>
      </div>
    </footer>
  );
}
