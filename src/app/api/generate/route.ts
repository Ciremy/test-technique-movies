import { NextResponse } from "next/server";
import { getContextForLLM } from "../../../services/neo4jService";
import { generateArticle } from "../../../services/llmService";

export async function POST(request: Request) {
  try {
    const { type, id } = await request.json();

    if (!type || !id || !["movie", "person"].includes(type)) {
      return NextResponse.json(
        {
          error:
            "Invalid parameters. 'type' must be 'movie' or 'person' and 'id' is required.",
        },
        { status: 400 }
      );
    }

    const context = await getContextForLLM(type, id);

    const article = await generateArticle(context, type);

    return NextResponse.json({ article });
  } catch (error) {
    console.error("[GENERATE ERROR]:", error);

    if (error instanceof Error) {
      if (error.message.includes("Tot found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      } else if (error.message.includes("Timeout")) {
        return NextResponse.json({ error: error.message }, { status: 504 });
      } else if (error.message.includes("Limit")) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      } else if (error.message.includes("Error LLM")) {
        return NextResponse.json({ error: error.message }, { status: 502 });
      }
    }

    return NextResponse.json(
      { error: "Internal error during generation" },
      { status: 500 }
    );
  }
}
