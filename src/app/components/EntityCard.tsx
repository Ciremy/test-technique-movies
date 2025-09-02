"use client";

import { MovieDetails, PersonDetails } from "@/lib/types";

type Entity = MovieDetails | PersonDetails;

export function EntityCard({ entity }: { entity: Entity }) {
  const isMovie = "title" in entity;
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-md">
      <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-4">
        {isMovie ? (
          <img
            src={
              entity.poster_path
                ? `https://image.tmdb.org/t/p/w500${entity.poster_path}`
                : "/movie-placeholder.jpg"
            }
            alt={entity.title}
            className="w-full max-h-96 object-contain rounded"
            onError={(e) => {
              e.currentTarget.src = "/movie-placeholder.jpg";
            }}
          />
        ) : (
          <img
            src={
              entity.filmography
                ? `https://image.tmdb.org/t/p/w500${entity.profile_path}`
                : "/person-placeholder.jpg"
            }
            alt={entity.name}
            className="w-full max-h-96 object-contain rounded"
            onError={(e) => {
              e.currentTarget.src = "/person-placeholder.jpg";
            }}
          />
        )}
      </div>

      <div className="md:w-2/3 p-6">
        <h2 className="text-2xl font-bold mb-2">
          {isMovie ? entity.title : entity.name}
        </h2>
        <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
          {isMovie ? (
            <>
              <span>{new Date(entity.release_date).getFullYear()}</span>
              <span>•</span>
              <span>{entity.genres.map((g) => g.name).join(", ")}</span>
              <span>•</span>
              <span>⭐ {entity.vote_average.toFixed(1)}/10</span>
            </>
          ) : (
            <span>Personnalité du cinéma</span>
          )}
        </div>

        {isMovie ? (
          <>
            {/* Synopsis */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Synopsis</h3>
              <p className="text-gray-700">{entity.overview}</p>
            </div>

            {/* Réalisateur */}
            {entity.director && (
              <div className="mb-2">
                <span className="font-semibold">Réalisateur:</span>
                <span> {entity.director.name}</span>
              </div>
            )}

            {/* Casting */}
            {entity.cast && entity.cast.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Casting principal</h3>
                <div className="flex flex-wrap gap-2">
                  {entity.cast.slice(0, 3).map((actor) => (
                    <div
                      key={actor.id}
                      className="bg-gray-100 px-2 py-1 rounded"
                    >
                      {actor.name}
                      {actor.character ? ` (${actor.character})` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Flimographie récente</h3>
              {entity.filmography[0].movie.title}
              <ul className="space-y-1">
                {entity.filmography.map((movie, id) => (
                  <li key={id} className="text-gray-700 text-sm">
                    • {movie.movie.original_title} (
                    {new Date(movie.movie.release_date).getFullYear()}) -
                    {movie.role === "ACTED_IN" ? " Acteur" : " Réalisateur"}
                    {movie.character && ` (${movie.character})`}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
