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
        "Paramètres invalides. Veuillez fournir un ID valide et un type (movie/person)",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
    let result: MovieDetails | PersonDetails;

    if (type === "movie") {
      result = await getMovieDetails(id);

      if (!result || !result.id) {
        const errorResponse: ApiError = {
          error: `Film avec ID ${id} non trouvé`,
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    } else {
      result = await getPersonDetails(id);

      if (!result || !result.id) {
        const errorResponse: ApiError = {
          error: `Personne avec ID ${id} non trouvée`,
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur dans l'API entities:", error);

    if (error instanceof Error) {
      if (error.message.includes("non trouvé")) {
        const errorResponse: ApiError = {
          error: error.message,
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    }

    const errorResponse: ApiError = {
      error: "Erreur interne lors de la récupération des données",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
