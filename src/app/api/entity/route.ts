import { NextResponse } from "next/server";
import {
  getMovieDetails,
  getPersonDetails,
} from "../../../services/neo4jService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || !type || !["movie", "person"].includes(type)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    let result;
    if (type === "movie") {
      result = await getMovieDetails(id);
    } else {
      result = await getPersonDetails(id);
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else {
      return NextResponse.json({ error: "Error" }, { status: 500 });
    }
  }
}
