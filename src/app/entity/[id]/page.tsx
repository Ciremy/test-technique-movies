import { notFound } from "next/navigation";
import { EntityCard } from "../../components/EntityCard";
import { ArticleGenerator } from "../../components/ArticleGenerator";
import { Metadata } from "next";

type EntityPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type: "movie" | "person" }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: EntityPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const type = resolvedSearchParams.type === "movie" ? "Film" : "Personnalité";

  return {
    title: `${type} - Générateur d'articles`,
    description: `Détails et article sur ${type.toLowerCase()} avec ID ${
      resolvedParams.id
    }`,
  };
}

async function getEntity(id: string, type: "movie" | "person") {
  try {
    const res = await fetch(
      `http://localhost:3000/api/entity?id=${id}&type=${type}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      console.log(id, type);

      console.error(`API Error: ${res.status} ${res.statusText}`);
      const errorData = await res.json().catch(() => ({}));
      console.error("Error details:", errorData);
      return notFound();
    }

    const data = await res.json();
    if (!data) {
      console.error("No data returned from API");
      return notFound();
    }
    return data;
  } catch (error) {
    console.error("Error fetching entity:", error);
    return notFound();
  }
}

export default async function EntityPage({
  params,
  searchParams,
}: EntityPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  if (
    !resolvedSearchParams.type ||
    !["movie", "person"].includes(resolvedSearchParams.type)
  ) {
    console.error("Invalid type parameter");
    return notFound();
  }
  const entity = await getEntity(resolvedParams.id, resolvedSearchParams.type);
  if (!entity) {
    console.error("Entity not found");
    return notFound();
  }
  return (
    <div className="space-y-6 py-6">
      <h1 className="text-2xl font-bold text-center">
        {resolvedSearchParams.type === "movie"
          ? "Fiche Film"
          : "Fiche Personnalité"}
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <EntityCard entity={entity} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ArticleGenerator
          entityId={resolvedParams.id}
          entityType={resolvedSearchParams.type}
        />
      </div>
    </div>
  );
}
