import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=sh&q=${encodeURIComponent(q)}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    // La risposta è [query, [suggerimento1, suggerimento2, ...]]
    const data = await res.json();
    const suggestions: string[] = Array.isArray(data[1]) ? data[1] : [];

    return NextResponse.json(suggestions.slice(0, 6));
  } catch {
    return NextResponse.json([]);
  }
}
