import { NextResponse } from "next/server";
import { searchEntities } from "../../../services/neo4jService";
import { SearchResult } from "../../../lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type");

  if (!q || !type || !["movie", "person"].includes(type)) {
    return NextResponse.json(
      { error: "Paramètres invalides" },
      { status: 400 }
    );
  }

  try {
    const results = await searchEntities(q, type as "movie" | "person");
    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
