import { NextResponse } from "next/server";
import {
  getMovieDetails,
  getPersonDetails,
} from "../../../services/neo4jService";
import { MovieDetails, PersonDetails, ApiError } from "../../../lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  const type = searchParams.get("type") as "movie" | "person" | null;
  if (!id || !type || !["movie", "person"].includes(type)) {
    const errorResponse: ApiError = {
      error:
        "Invalid parameters. Please provide a valid ID and type (movie/person)",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
    let result: MovieDetails | PersonDetails;

    if (type === "movie") {
      result = await getMovieDetails(id);

      if (!result || !result.id) {
        const errorResponse: ApiError = {
          error: `Movie with ID ${id} not found`,
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    } else {
      result = await getPersonDetails(id);

      if (!result || !result.id) {
        const errorResponse: ApiError = {
          error: `Person with ID ${id} not found`,
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in the entities API:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        const errorResponse: ApiError = {
          error: error.message,
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    }

    const errorResponse: ApiError = {
      error: "Internal error while retrieving data",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
