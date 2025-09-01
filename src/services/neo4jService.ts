import driver from "../lib/neo4j";
import { SearchResult, MovieDetails, PersonDetails } from "../lib/types";

export async function searchEntities(
  query: string,
  type: "movie" | "person"
): Promise<SearchResult[]> {
  const session = driver.session();
  try {
    const index = type === "movie" ? "movieTitleIndex" : "personNameIndex";
    const result = await session.run(
      `CALL db.index.fulltext.queryNodes('${index}', '${query}*')
       YIELD node, score
       RETURN node, score
       ORDER BY score DESC
       LIMIT 10`
    );
    return result.records.map((record) => {
      const node = record.get("node");
      return {
        id: node.properties.tmdbId.toString(),
        title: node.properties.title,
        name: node.properties.name,
        type,
        poster_path: node.properties.poster_path,
        profile_path: node.properties.profile_path,
      };
    });
  } finally {
    await session.close();
  }
}

export async function getMovieDetails(id: string): Promise<MovieDetails> {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Movie {tmdbId: toInteger($id)})
      OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
      OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Person)
      OPTIONAL MATCH (m)<-[:DIRECTED]-(d:Person)
      RETURN
        m AS movie,
        collect(DISTINCT g.name) AS genres,  // Ajout de DISTINCT pour éviter les doublons
        collect({id: a.tmdbId, name: a.name, character: a.character}) AS cast,
        d AS director
      `,
      { id }
    );

    if (result.records.length === 0) {
      throw new Error(`Film avec l'ID ${id} non trouvé`);
    }

    const record = result.records[0];
    const movie = record.get("movie").properties;
    const director = record.get("director");

    const genres = record
      .get("genres")
      .filter((genre: string) => genre && genre.trim() !== "")
      .map((name: string) => ({ name }));

    return {
      id: movie.tmdbId.toString(),
      title: movie.title,
      original_title: movie.original_title,
      release_date: movie.release_date,
      overview: movie.overview,
      vote_average: movie.vote_average,
      poster_path: movie.poster_path,
      genres: genres,
      cast: record.get("cast"),
      director: director
        ? {
            id: director.properties.tmdbId.toString(),
            name: director.properties.name,
          }
        : undefined,
    };
  } finally {
    await session.close();
  }
}

export async function getPersonDetails(id: string): Promise<PersonDetails> {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (p:Person {tmdbId: toInteger($id)})
      OPTIONAL MATCH (p)-[r:ACTED_IN|DIRECTED]->(m:Movie)
      RETURN p AS person,
             collect({
               id: m.tmdbId,
               title: m.title,
               role: type(r),
               character: r.character
             }) AS filmography
      `,
      { id }
    );

    if (result.records.length === 0) {
      throw new Error(`Personne avec l'ID ${id} non trouvée`);
    }

    const record = result.records[0];
    const person = record.get("person").properties;

    return {
      id: person.tmdbId.toString(),
      name: person.name,
      filmography: record.get("filmography") || [],
    };
  } finally {
    await session.close();
  }
}

export async function getContextForLLM(
  type: "movie" | "person",
  id: string
): Promise<string> {
  const session = driver.session();
  try {
    let context = "";

    if (type === "movie") {
      const result = await session.run(
        `
        MATCH (m:Movie {tmdbId: toInteger($id)})
        OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
        OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Person)
        OPTIONAL MATCH (m)<-[:DIRECTED]-(d:Person)
        RETURN
          m.title AS title,
          m.release_date AS releaseDate,
          m.overview AS overview,
          collect(DISTINCT g.name) AS genres,
          d.name AS directorName,
          collect(DISTINCT a.name) AS cast
        `,
        { id }
      );

      if (result.records.length === 0) {
        throw new Error(`Film avec l'ID ${id} non trouvé`);
      }

      const record = result.records[0];
      const title = record.get("title");
      const releaseDate = record.get("releaseDate");
      const overview = record.get("overview");
      const genres = record.get("genres");
      const directorName = record.get("directorName");
      const cast = record.get("cast");

      context = `
        Titre: ${title}
        Date de sortie: ${releaseDate}
        Réalisateur: ${directorName || "Inconnu"}
        Genres: ${genres.join(", ") || "Aucun"}
        Acteurs principaux: ${cast.join(", ") || "Aucun"}
        Synopsis: ${overview || "Aucun synopsis disponible"}
      `;
    } else {
      const result = await session.run(
        `
        MATCH (p:Person {tmdbId: toInteger($id)})
        OPTIONAL MATCH (p)-[r:ACTED_IN|DIRECTED]->(m:Movie)
        RETURN
          p.name AS name,
          collect({
            title: m.title,
            role: type(r),
            year: m.release_date,
            character: r.character
          }) AS filmography
        `,
        { id }
      );

      if (result.records.length === 0) {
        throw new Error(`Personne avec l'ID ${id} non trouvée`);
      }

      const record = result.records[0];
      const name = record.get("name");
      const filmography = record.get("filmography");

      context = `
        Nom: ${name}
        Filmographie:
        ${filmography
          .map(
            (item: any) =>
              `- ${item.title} (${item.year}) : ${
                item.role === "ACTED_IN" ? "Acteur" : "Réalisateur"
              }${item.character ? ` (rôle: ${item.character})` : ""}`
          )
          .join("\n")}
      `;
    }

    return context.trim();
  } finally {
    await session.close();
  }
}
