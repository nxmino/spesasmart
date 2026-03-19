import type { ProductResult, ShopRow, Offer } from "@/types";

function extractShopKey(url: string, shopName: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (hostname.includes("google.")) return shopName.toLowerCase().trim();
    return hostname;
  } catch {
    return shopName.toLowerCase().trim();
  }
}

export function aggregateResults(productResults: ProductResult[]): ShopRow[] {
  const completed = productResults.filter(
    (r) => !r.loading && r.offers.length > 0
  );
  if (completed.length === 0) return [];

  const shopMap = new Map<
    string,
    { displayName: string; best: Map<string, Offer> }
  >();

  for (const pr of completed) {
    for (const offer of pr.offers) {
      const key = extractShopKey(offer.url, offer.shop);

      if (!shopMap.has(key)) {
        shopMap.set(key, { displayName: offer.shop, best: new Map() });
      }

      const entry = shopMap.get(key)!;
      const existing = entry.best.get(pr.product);
      if (!existing || offer.price < existing.price) {
        entry.best.set(pr.product, offer);
        if (offer.shop.length < entry.displayName.length) {
          entry.displayName = offer.shop;
        }
      }
    }
  }

  const rows: ShopRow[] = [];

  for (const [shopKey, { displayName, best }] of Array.from(shopMap.entries())) {
    let subtotal = 0;
    let foundCount = 0;
    const items: ShopRow["items"] = [];

    for (const pr of completed) {
      const offer = best.get(pr.product);
      if (offer) {
        subtotal += offer.price;
        foundCount++;
        items.push({
          product: pr.product,
          found: true,
          title: offer.title,
          price: offer.price,
          affiliateUrl: offer.affiliateUrl,
        });
      } else {
        items.push({ product: pr.product, found: false });
      }
    }

    rows.push({
      shop: displayName,
      shopKey,
      foundCount,
      totalProducts: completed.length,
      subtotal,
      items,
    });
  }

  // Ordina: foundCount DESC poi subtotal ASC
  return rows.sort((a, b) => {
    if (b.foundCount !== a.foundCount) return b.foundCount - a.foundCount;
    return a.subtotal - b.subtotal;
  });
}
