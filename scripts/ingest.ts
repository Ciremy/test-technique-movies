import axios from "axios";
import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";

dotenv.config();

type TMDBMovie = {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  vote_average: number;
  poster_path: string;
  genres?: Array<{ id: number; name: string }>;
};

type TMDBPerson = {
  id: number;
  name: string;
  job?: string;
  character?: string;
};

type TMDBCredits = {
  cast: TMDBPerson[];
  crew: TMDBPerson[];
};

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
);

async function testNeo4jConnection(): Promise<void> {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (n) RETURN count(n) AS nodeCount");
    const nodeCount = result.records[0].get("nodeCount").toNumber();
    console.log(
      `Connexion à Neo4j réussie ! Nombre de nœuds existants : ${nodeCount}`
    );
  } catch (error) {
    console.error("Erreur lors de la connexion à Neo4j :", error);
  } finally {
    await session.close();
  }
}

async function resetNeo4jDatabase(): Promise<void> {
  const session = driver.session();
  try {
    await session.run("MATCH (n) DETACH DELETE n");
    await session.run(
      "CREATE CONSTRAINT unique_movie_tmdbId IF NOT EXISTS FOR (m:Movie) REQUIRE m.tmdbId IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT unique_person_tmdbId IF NOT EXISTS FOR (p:Person) REQUIRE p.tmdbId IS UNIQUE"
    );
    await session.run(
      "CREATE FULLTEXT INDEX movieTitleIndex IF NOT EXISTS FOR (m:Movie) ON EACH [m.title]"
    );
    await session.run(
      "CREATE FULLTEXT INDEX personNameIndex IF NOT EXISTS FOR (p:Person) ON EACH [p.name]"
    );
    console.log("Base de données réinitialisée avec succès !");
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation de la base de données :",
      error
    );
  } finally {
    await session.close();
  }
}

async function fetchPopularMovies(): Promise<TMDBMovie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  const movies: TMDBMovie[] = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=${page}`;
    const response = await axios.get(url);
    movies.push(...response.data.results);
  }
  return movies;
}

async function fetchMovieCredits(movieId: number): Promise<TMDBCredits> {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=fr-FR`;
  const response = await axios.get(url);
  return response.data;
}

async function fetchMovieDetails(movieId: number): Promise<TMDBMovie> {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=fr-FR`;
  const response = await axios.get(url);
  return response.data;
}

async function ingestMovieIntoNeo4j(movie: TMDBMovie): Promise<void> {
  const session = driver.session();
  try {
    const movieDetails = await fetchMovieDetails(movie.id);
    const credits = await fetchMovieCredits(movie.id);
    const director = credits.crew.find(
      (person: TMDBPerson) => person.job === "Director"
    );

    const query = `
      MERGE (m:Movie {tmdbId: $movieId})
      SET m.title = $title,
          m.original_title = $originalTitle,
          m.release_date = $releaseDate,
          m.overview = $overview,
          m.vote_average = $voteAverage,
          m.poster_path = $posterPath

      // Ajouter les genres
      FOREACH (genre IN $genres |
        MERGE (g:Genre {name: genre.name})
        MERGE (m)-[:IN_GENRE]->(g)
      )

      // Ajouter le réalisateur
      WITH m
      MERGE (dir:Person {tmdbId: $directorId})
      SET dir.name = $directorName
      MERGE (dir)-[:DIRECTED]->(m)

      // Ajouter les acteurs
      WITH m
      UNWIND $cast AS actor
      MERGE (a:Person {tmdbId: actor.id})
      SET a.name = actor.name
      MERGE (a)-[:ACTED_IN {role: actor.character}]->(m)
    `;

    await session.run(query, {
      movieId: movie.id,
      title: movieDetails.title,
      originalTitle: movieDetails.original_title,
      releaseDate: movieDetails.release_date,
      overview: movieDetails.overview,
      voteAverage: movieDetails.vote_average,
      posterPath: movieDetails.poster_path,
      genres: movieDetails.genres || [],
      directorId: director?.id,
      directorName: director?.name,
      cast: credits.cast.map((actor: TMDBPerson) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
      })),
    });
    console.log(`Film ingéré : ${movieDetails.title}`);
  } catch (error) {
    console.error(`Erreur lors de l'ingestion du film ${movie.title}:`, error);
  } finally {
    await session.close();
  }
}

async function main(): Promise<void> {
  try {
    await testNeo4jConnection();
    await resetNeo4jDatabase();
    const movies = await fetchPopularMovies();
    console.log(`Nombre total de films récupérés : ${movies.length}`);
    for (let i = 0; i < movies.length; i++) {
      await ingestMovieIntoNeo4j(movies[i]);
      if (i < movies.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    console.log("Ingestion terminée !");
  } catch (error) {
    console.error("Erreur principale :", error);
  } finally {
    await driver.close();
  }
}

main();
