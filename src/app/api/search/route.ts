import { NextResponse } from "next/server";
import { searchEntities } from "../../../services/neo4jService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type");

  if (!q || !type || !["movie", "person"].includes(type)) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const results = await searchEntities(q, type as "movie" | "person");
    return NextResponse.json(Array.isArray(results) ? results : []);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}
