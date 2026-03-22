# SpesaSmart — Roadmap di Monetizzazione

## Obiettivo

1. Rendere l'app indispensabile (retention hooks)
2. Pubblicare su Play Store (Android) e App Store (iOS)
3. Introdurre un modello freemium per generare revenue diretta

---

## Priorità di implementazione

### P1 — Settimane 1-2: Foundation + quick wins (zero backend)

| # | Task | Stato |
|---|------|-------|
| 1 | **PNG icons** — sblocca Play Store | ✅ completato |
| 2 | **TWA Android** via Bubblewrap — primo canale store | ✅ completato (fingerprint da aggiornare) |
| 3 | **Shareable Links** — `/compare?q=...` per acquisizione organica | ✅ completato |
| 4 | **Auto-save + cap 10 sessioni** free — costruisce dati per upsell | ✅ completato |

### P2 — Settimane 3-6: Infrastructure premium + revenue

| # | Task | Stato |
|---|------|-------|
| 5 | **Supabase + Auth** — scheletro backend (magic link + Google OAuth) | ⬜ da fare |
| 6 | **Usage limits + PremiumGate + upgrade modal** | ⬜ da fare |
| 7 | **Stripe payments** — prime revenue reali | ⬜ da fare |
| 8 | **Multi-store split optimizer** — killer feature differenziante (solo frontend) | ⬜ da fare |

### P3 — Settimane 7-10: Retention + crescita

| # | Task | Stato |
|---|------|-------|
| 9 | **Price history charts** — sparkline "oggi €38, risparmi €7" | ⬜ da fare |
| 10 | **Shopping Lists** — "Spesa di Natale", "Elettronica" | ⬜ da fare |
| 11 | **Barcode Scanner** via Capacitor | ⬜ da fare |
| 12 | **iOS App Store** + RevenueCat IAP | ⬜ da fare |

### P4 — Settimane 11-12: Engagement

| # | Task | Stato |
|---|------|-------|
| 13 | **Price Alerts + Push Notifications** — DAU senza sforzo cosciente | ⬜ da fare |
| 14 | **Weekly savings digest** push notification | ⬜ da fare |

---

## Modello Freemium

**Prezzi:**
- **Free** — sempre gratis, no carta di credito
- **Premium** — €2,99/mese o €19,99/anno (risparmio 44%)
- **Lifetime** — €39,99 (promozione lancio)

**Split funzionalità:**

| Funzionalità | Free | Premium |
|---|---|---|
| Ricerche al giorno | 5 | Illimitate |
| Cronologia sessioni | Ultime 10 | Illimitata |
| Shopping lists | 1 max | Illimitate |
| Cart optimizer | Negozio singolo | Multi-store split |
| Price alerts | 0 | Fino a 50 |
| Auto-save cronologia | No (manuale) | Sì |
| Grafici cronologia prezzi | No | Sì |
| Export CSV | No | Sì |
| Barcode scanner | 3/giorno | Illimitato |
| Shareable links | Sì | Sì |

---

## Stack tecnico

| Componente | Tecnologia | Note |
|---|---|---|
| Backend | **Supabase** | Free tier, Postgres, auth integrata, RLS |
| Auth | Magic link email + Google OAuth | No password, frizione minima |
| Pagamenti web | **Stripe** | Nessuna fee di piattaforma |
| Pagamenti native | **RevenueCat** | Astrae Apple IAP + Google Play Billing |
| Android store | **TWA via Bubblewrap** | Zero modifiche al codice app |
| iOS store | **Capacitor** | WKWebView + plugin nativi |
| Push notifications | Web Push API | Service worker già presente |
| Price alert cron | Vercel Cron o Supabase Edge Functions | Riusa `/api/search` esistente |

---

## Architettura pagamenti

```
Utente Web/TWA  → Stripe Checkout → webhook → Supabase (subscription.status = active)
Utente iOS      → RevenueCat IAP  → webhook → Supabase (subscription.status = active)
Utente Android  → RevenueCat IAP  → webhook → Supabase (subscription.status = active)
```

Supabase è la single source of truth per "è premium?".
Esporre `usePlan()` hook client-side e `<PremiumGate>` component wrapper.

---

## Distribuzione sugli store

### Android — Trusted Web Activity (TWA) ✅

Zero duplicazione di codice. La PWA punta a `https://spesasmart-lilac.vercel.app`.

**Passi completati nel codice:**
- PNG icons 192×192 e 512×512 in `public/icons/`
- `public/.well-known/assetlinks.json` creato con package `app.spesasmart.twa`
- `manifest.json` aggiornato con `id`, `scope`, `display_override`

**Passi manuali da fare una volta (sul tuo PC):**

```bash
# 1. Installa Bubblewrap
npm i -g @bubblewrap/cli

# 2. Genera il progetto Android dal manifest live
bubblewrap init --manifest https://spesasmart-lilac.vercel.app/manifest.json
#   → Package ID: app.spesasmart.twa
#   → Lascia generare un nuovo keystore (salva la password!)

# 3. Ottieni la fingerprint SHA-256 del keystore
keytool -list -v -keystore android.keystore | grep "SHA256:"
#   → Copia il valore tipo: AB:CD:12:34:EF:...

# 4. Aggiorna public/.well-known/assetlinks.json nel repo
#   → Sostituisci PLACEHOLDER_SHA256_FINGERPRINT con il valore reale
#   → git commit + push → aspetta deploy Vercel

# 5. Verifica Digital Asset Links
#   → https://developers.google.com/digital-asset-links/tools/generator
#   → Inserisci https://spesasmart-lilac.vercel.app e app.spesasmart.twa

# 6. Build AAB per Google Play Console
bubblewrap build
#   → Carica il file .aab su Google Play Console ($25 una tantum)
```

### iOS — Capacitor Wrapper ⬜ (P3)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init SpesaSmart com.spesasmart.app
# Configurare per caricare dall'URL live → aggiornamenti senza review
# Aggiungere @capacitor/camera per barcode scanner
# Icone PNG tutte le dimensioni Apple (20px → 1024px)
# Info.plist con permesso fotocamera in italiano
```
Costo: $99/anno Apple Developer Program.

---

## File da modificare nelle prossime fasi

```
types/index.ts              → ShoppingList, WatchlistItem, PriceSnapshot, SubscriptionPlan
lib/aggregate.ts            → multi-store split optimizer
hooks/useSessions.ts        → sync Supabase
components/HomeClient.tsx   → gating limiti uso

Nuovi file (P2):
  lib/supabase.ts
  lib/features.ts
  hooks/usePlan.ts
  components/PremiumGate.tsx
  app/login/page.tsx
  app/account/page.tsx
  app/alerts/page.tsx
  app/api/webhooks/stripe/route.ts
```

---

## Note di verifica

- PWA web: deve continuare a funzionare all'URL Vercel dopo ogni modifica
- TWA Android: testare con `bubblewrap install` su emulatore Android
- Freemium limits: testare in incognito (localStorage vuoto), verificare modal upgrade
- Stripe: usare test mode con carte Stripe di test
- Supabase RLS: verificare che utenti non vedano sessioni altrui
