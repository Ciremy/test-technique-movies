"use client";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  type: "movie" | "person";
  poster_path?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchResults = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          q: debouncedQuery,
        });

        const response = await fetch(`/api/search?${searchParams.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        setResults(data.slice(0, 5));
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Search error");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un film, acteur ou réalisateur..."
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isLoading && <div className="absolute right-2 top-2">🔍</div>}
      {error && (
        <div className="absolute z-10 w-full mt-1 p-2 bg-red-100 text-red-700 rounded text-sm">
          ⚠️ {error}
        </div>
      )}
      {results.length > 0 && !error && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
          {results.map((result) => (
            <li
              key={`${result.id}-${result.type}`}
              onClick={() => {
                router.push(`/entity/${result.id}?type=${result.type}`);
                setQuery("");
                setResults([]);
              }}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
            >
              {result.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                  alt={result.title || result.name || "Entity image"}
                  className="w-10 h-14 object-cover mr-2"
                  onError={(e) => {
                    e.currentTarget.src =
                      result.type === "movie"
                        ? "/movie-placeholder.jpg"
                        : "/person-placeholder.jpg";
                  }}
                />
              ) : (
                <div className="w-10 h-14 bg-gray-200 mr-2 flex items-center justify-center">
                  {result.type === "movie" ? "🎬" : "👤"}
                </div>
              )}
              <div>
                <div className="font-medium">{result.title || result.name}</div>
                <div className="text-sm text-gray-500">
                  {result.type === "movie" ? "Film" : "Personne"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
