export type SearchResult = {
  id: string;
  title?: string;
  name?: string;
  type: "movie" | "person";
  poster_path?: string;
  profile_path?: string;
};

export type MovieDetails = {
  id: string;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  vote_average: number;
  poster_path?: string;
  genres: Array<{ name: string }>;
  cast: Array<{ id: string; name: string; character: string }>;
  director?: { id: string; name: string };
};

export type PersonDetails = {
  id: string;
  name: string;
  filmography: Array<{
    id: string;
    title: string;
    role: "ACTED_IN" | "DIRECTED";
    character?: string;
  }>;
};

export type GenerateRequest = {
  type: "movie" | "person";
  id: string;
};

export type GenerateResponse = {
  article: string;
};

export type ApiError = {
  error: string;
};
