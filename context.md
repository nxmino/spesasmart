# SpesaSmart — Context per Claude Code

## Cos'è l'app
PWA installabile dal browser (no store) che permette all'utente di inserire
una lista di prodotti da acquistare e trovare automaticamente la combinazione
di negozi online più conveniente, tenendo conto delle spese di spedizione.
L'utente NON acquista nell'app — l'app mostra solo i prezzi e i link,
l'acquisto avviene manualmente sul sito del negozio.
Nessun login, nessun database remoto. Tutto salvato in localStorage.

## Stack tecnico
- Next.js 14 App Router + TypeScript
- Tailwind CSS per lo styling
- next-pwa per installabilità PWA
- Serper.dev API per Google Shopping (env: SERPER_API_KEY)
- Google Suggest API (gratuita, no chiave) per autocomplete
- localStorage per persistenza storico ricerche (no Prisma, no DB)

## Struttura pagine
- / → homepage con form inserimento prodotti e tabella risultati real-time
- /history → storico ricerche salvate (da localStorage)
- /api/autocomplete → proxy Google Suggest
- /api/search → ricerca prezzi singolo prodotto su Serper.dev

## Struttura dati localStorage
- Chiave: "spesasmart_sessions"
- Valore: array JSON di oggetti:
  { id: string, label: string, createdAt: string, products: string[], results: object }

## Monetizzazione
- Link Amazon con tag affiliato (env: AMAZON_AFFILIATE_TAG)
- Altri negozi con redirect Awin (env: AWIN_MID)

## Variabili d'ambiente (.env.local)
SERPER_API_KEY=
AMAZON_AFFILIATE_TAG=
AWIN_MID=

## Regole di sviluppo
- Componenti client separati da server components
- Tutti i fetch verso API esterne passano da route API interne (mai dal client diretto)
- Nessuna libreria UI esterna (solo Tailwind)
- Mobile-first responsive
