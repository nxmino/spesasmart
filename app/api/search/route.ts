import { NextRequest, NextResponse } from "next/server";
import type { Offer } from "@/types";

const SERPAPI_BASE = "https://serpapi.com/search";

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

// ─── Fetch negozi per un prodotto via Immersive Product API ──────────────────
// Restituisce fino a 13 negozi con link DIRETTO + spedizione strutturata

async function fetchStores(
  pageToken: string,
  apiKey: string,
  productName: string
): Promise<Offer[]> {
  try {
    const params = new URLSearchParams({
      engine: "google_immersive_product",
      api_key: apiKey,
      page_token: pageToken,
      more_stores: "true",
    });

    const res = await fetch(`${SERPAPI_BASE}?${params.toString()}`);
    if (!res.ok) return [];

    const data = await res.json();

    // Path confermato dalla risposta reale: product_results.stores
    const stores: Record<string, unknown>[] =
      data?.product_results?.stores ??
      data?.sellers_results?.online_sellers ??
      [];

    return stores.flatMap((store) => {
      const price =
        typeof store.extracted_price === "number"
          ? store.extracted_price
          : parsePrice(store.price as string);
      if (price <= 0) return [];

      // Link diretto al negozio (non Google)
      const url =
        (store.link as string) ||
        (store.direct_link as string) ||
        "";

      // Spedizione: shipping_extracted è già numerico (SerpAPI lo parsa per noi)
      const shippingExtracted =
        typeof store.shipping_extracted === "number"
          ? store.shipping_extracted
          : null;

      // additional_price.shipping per google_product fallback
      const additionalPrice = store.additional_price as Record<string, unknown> | undefined;
      const additionalShipping = additionalPrice?.shipping
        ? parsePrice(additionalPrice.shipping as string)
        : null;

      const shippingCost = shippingExtracted ?? additionalShipping ?? undefined;

      // Testo spedizione
      let shippingText = "";
      const shippingRaw = (store.shipping as string) || "";
      const detailsArr = store.details_and_offers as (string | { text?: string })[] | undefined;
      const deliveryDetail = detailsArr
        ?.map((d) => (typeof d === "string" ? d : d?.text ?? ""))
        .find((t) => /delivery|spedizione|free|gratuita|consegna/i.test(t));

      if (shippingCost === 0) {
        shippingText = "Spedizione gratuita";
      } else if (shippingCost !== undefined && shippingCost > 0) {
        shippingText = shippingRaw || `€ ${shippingCost.toFixed(2).replace(".", ",")}`;
      } else if (
        shippingRaw.toLowerCase().includes("free") ||
        shippingRaw.toLowerCase().includes("gratuita") ||
        deliveryDetail?.toLowerCase().includes("free") ||
        deliveryDetail?.toLowerCase().includes("gratuita")
      ) {
        shippingText = "Spedizione gratuita";
      } else if (deliveryDetail) {
        shippingText = deliveryDetail;
      }

      return [
        {
          shop: (store.name as string) || "Sconosciuto",
          title: (store.title as string) || productName,
          price,
          url,
          affiliateUrl: buildAffiliateUrl(url),
          shipping: shippingText || undefined,
          shippingCost: shippingCost !== undefined ? shippingCost : undefined,
        } satisfies Offer,
      ];
    });
  } catch {
    return [];
  }
}

// ─── Fallback: google_product (sellers_results.online_sellers) ───────────────

async function fetchProductSellers(
  productId: string,
  apiKey: string,
  productName: string
): Promise<Offer[]> {
  try {
    const params = new URLSearchParams({
      engine: "google_product",
      api_key: apiKey,
      product_id: productId,
      gl: "it",
      hl: "it",
    });

    const res = await fetch(`${SERPAPI_BASE}?${params.toString()}`);
    if (!res.ok) return [];

    const data = await res.json();
    const sellers: Record<string, unknown>[] =
      data?.sellers_results?.online_sellers ?? [];

    return sellers.flatMap((seller) => {
      const price = parsePrice(seller.base_price as string);
      if (price <= 0) return [];

      const url =
        (seller.direct_link as string) ||
        (seller.link as string) ||
        "";

      const additionalPrice = seller.additional_price as Record<string, unknown> | undefined;
      const shippingStr = (additionalPrice?.shipping as string) || "";
      const shippingCost = parsePrice(shippingStr);

      let shippingText = "";
      if (shippingCost === 0 || shippingStr.toLowerCase().includes("free") || shippingStr.includes("0")) {
        shippingText = "Spedizione gratuita";
      } else if (shippingCost > 0 && shippingCost <= 25) {
        shippingText = shippingStr;
      }

      return [
        {
          shop: (seller.name as string) || "Sconosciuto",
          title: productName,
          price,
          url,
          affiliateUrl: buildAffiliateUrl(url),
          shipping: shippingText || undefined,
          shippingCost: shippingCost <= 25 ? shippingCost : undefined,
        } satisfies Offer,
      ];
    });
  } catch {
    return [];
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product: string = body?.product?.trim();
    if (!product) {
      return NextResponse.json(
        { error: "Parametro product mancante" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SERPAPI_API_KEY non configurata" },
        { status: 500 }
      );
    }

    // ── Step 1: google_shopping → trova i prodotti e i loro token ─────────────
    const shoppingParams = new URLSearchParams({
      engine: "google_shopping",
      api_key: apiKey,
      q: product,
      gl: "it",
      hl: "it",
    });

    const shoppingRes = await fetch(`${SERPAPI_BASE}?${shoppingParams.toString()}`);
    if (!shoppingRes.ok) {
      const text = await shoppingRes.text().catch(() => "");
      console.error("SerpAPI shopping error:", shoppingRes.status, text);
      return NextResponse.json(
        { error: "Errore ricerca SerpAPI" },
        { status: 502 }
      );
    }

    const shoppingData = await shoppingRes.json();
    const shoppingResults: Record<string, unknown>[] =
      shoppingData?.shopping_results ?? [];

    // ── Step 2: prendi top 3 immersive_product_page_token per copertura max ──
    const pageTokens = [
      ...new Set(
        shoppingResults
          .map((r) => r.immersive_product_page_token as string)
          .filter(Boolean)
      ),
    ].slice(0, 3);

    // Fallback: product_id per google_product API
    const productIds = [
      ...new Set(
        shoppingResults
          .map((r) => r.product_id as string)
          .filter(Boolean)
      ),
    ].slice(0, 3);

    // ── Step 2a: Immersive Product API (preferita, link diretto + shipping) ──
    let allOffers: Offer[] = [];

    if (pageTokens.length > 0) {
      const storeResults = await Promise.all(
        pageTokens.map((token) => fetchStores(token, apiKey, product))
      );
      allOffers = storeResults.flat();
    }

    // ── Step 2b: Fallback google_product se immersive non ha dato risultati ──
    if (allOffers.length === 0 && productIds.length > 0) {
      const sellerResults = await Promise.all(
        productIds.map((id) => fetchProductSellers(id, apiKey, product))
      );
      allOffers = sellerResults.flat();
    }

    // ── Deduplicazione: per ogni negozio tieni il prezzo più basso ────────────
    const shopBest = new Map<string, Offer>();
    for (const offer of allOffers) {
      const key = offer.shop.toLowerCase().trim();
      const existing = shopBest.get(key);
      if (!existing || offer.price < existing.price) {
        shopBest.set(key, offer);
      }
    }

    const offers = Array.from(shopBest.values()).sort(
      (a, b) => a.price - b.price
    );

    return NextResponse.json({ product, offers });
  } catch (err) {
    console.error("Errore /api/search:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
