import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${
        process.env.TMDB_API_KEY
      }&query=${encodeURIComponent(query)}&language=fr-FR`
    );

    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.status}`);
    }

    const data = await tmdbResponse.json();
    const results = data.results
      .filter(
        (item: any) =>
          item.media_type === "movie" || item.media_type === "person"
      )
      .map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        name: item.name,
        type: item.media_type,
        poster_path: item.poster_path || item.profile_path,
      }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
