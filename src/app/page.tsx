import { SearchBar } from "./components/SearchBar";

export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6">
        Générateur d&apos;articles cinéma
      </h1>
      <SearchBar />
      <div className="mt-8 text-center">
        <p>Recherchez un film, un acteur ou un réalisateur pour commencer</p>
      </div>
    </>
  );
}
