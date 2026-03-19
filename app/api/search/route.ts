import { NextRequest, NextResponse } from "next/server";
import type { Offer } from "@/types";

// ─── Utilità prezzi ───────────────────────────────────────────────────────────

function parsePrice(raw: string | undefined | null): number {
  if (!raw) return 0;
  const cleaned = raw
    .replace(/[€$£]/g, "")
    .replace(/[^\d,. ]/g, " ")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// ─── Trova URL reale del negozio via ricerca organica ─────────────────────────

async function findMerchantUrl(
  title: string,
  shop: string,
  apiKey: string
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        q: `${title} ${shop}`,
        gl: "it",
        hl: "it",
        num: 5,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) return null;

    const data = await res.json();
    const organic: { link?: string }[] = data.organic ?? [];

    // Preferisci il primo risultato che contiene il nome del negozio nell'URL
    const shopSlug = shop.toLowerCase().replace(/[^a-z0-9]/g, "");
    const best = organic.find(
      (r) => r.link && r.link.toLowerCase().includes(shopSlug)
    );

    return best?.link ?? organic[0]?.link ?? null;
  } catch {
    return null;
  }
}

// ─── Affiliate URL ────────────────────────────────────────────────────────────

function buildAffiliateUrl(url: string): string {
  if (!url) return url;
  if (url.includes("amazon")) {
    const tag = process.env.AMAZON_AFFILIATE_TAG;
    if (!tag) return url;
    return `${url}${url.includes("?") ? "&" : "?"}tag=${tag}`;
  }
  const mid = process.env.AWIN_MID;
  if (!mid) return url;
  return `https://www.awin1.com/cread.php?awinmid=${mid}&clickref=&p=${encodeURIComponent(url)}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product: string = body?.product?.trim();
    if (!product) {
      return NextResponse.json({ error: "Parametro product mancante" }, { status: 400 });
    }

    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SERPER_API_KEY non configurata" }, { status: 500 });
    }

    // ── Step 1: Shopping API → prezzi ────────────────────────────────────────
    const serperRes = await fetch("https://google.serper.dev/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify({ q: product, gl: "it", hl: "it", num: 10 }),
    });

    if (!serperRes.ok) {
      return NextResponse.json({ error: "Errore ricerca Serper" }, { status: 502 });
    }

    const shoppingData = await serperRes.json();
    const raw: Record<string, unknown>[] = shoppingData?.shopping ?? [];

    const baseOffers = raw
      .map((item) => {
        const price = parsePrice(item.price as string);
        if (price <= 0) return null;
        return {
          shop: (item.source as string) || "Sconosciuto",
          title: (item.title as string) || product,
          price,
        };
      })
      .filter((o): o is NonNullable<typeof o> => o !== null);

    if (baseOffers.length === 0) {
      return NextResponse.json({ product, offers: [] });
    }

    // ── Step 2: Per ogni offerta → trova URL reale (tutto in parallelo) ──────
    const enriched = await Promise.allSettled(
      baseOffers.map(async (base) => {
        const merchantUrl = await findMerchantUrl(base.title, base.shop, apiKey);
        const url = merchantUrl ?? "";
        return {
          shop: base.shop,
          title: base.title,
          price: base.price,
          url,
          affiliateUrl: buildAffiliateUrl(url),
        } satisfies Offer;
      })
    );

    const offers: Offer[] = enriched
      .map((r, i) => {
        if (r.status === "fulfilled") return r.value;
        // Fallback senza link se la ricerca organica fallisce
        return {
          shop: baseOffers[i].shop,
          title: baseOffers[i].title,
          price: baseOffers[i].price,
          url: "",
          affiliateUrl: "",
        } satisfies Offer;
      })
      .sort((a, b) => a.price - b.price);

    return NextResponse.json({ product, offers });
  } catch (err) {
    console.error("Errore /api/search:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
