import { NextResponse } from "next/server";
import driver from "../../../lib/neo4j";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (m:Movie)
      WHERE toLower(m.title) CONTAINS toLower($searchQuery)
      RETURN
        m.tmdbId AS id,
        m.title AS title,
        null AS name,
        "movie" AS type,
        m.poster_path AS poster_path

      UNION

      MATCH (p:Person)
      WHERE toLower(p.name) CONTAINS toLower($searchQuery)
      RETURN
        p.tmdbId AS id,
        null AS title,
        p.name AS name,
        "person" AS type,
        p.profile_path AS poster_path

      ORDER BY
        CASE
          WHEN type = "movie" THEN title
          WHEN type = "person" THEN name
          ELSE ""
        END
      LIMIT 10
    `,
      { searchQuery: query }
    );

    const formattedResults = result.records.map((record) => ({
      id: record.get("id").toString(),
      title: record.get("title"),
      name: record.get("name"),
      type: record.get("type"),
      poster_path: record.get("poster_path"),
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
