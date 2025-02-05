import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const PokemonApp = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterType, setFilterType] = useState("all");

  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=100`
        );
        if (!response.ok) throw new Error("Failed to fetch Pokemon");
        const data = await response.json();

        // Fetch detailed data for each Pokemon
        const detailedData: any = await Promise.all(
          data.results.map(async (pokemon: any) => {
            const res = await fetch(pokemon.url);
            return res.json();
          })
        );

        setPokemon(detailedData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  // Filter and sort pokemon
  const filteredPokemon = pokemon
    .filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        filterType === "all" ||
        p.types.some((t: any) => t.type.name === filterType);
      return matchesSearch && matchesType;
    })
    .sort((a: any, b: any) => {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  // Paginate results
  const paginatedPokemon = filteredPokemon.slice(offset, offset + itemsPerPage);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading Pokemon: {error}</AlertDescription>
      </Alert>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Pokemon..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="p-2 border rounded-lg"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
          <select
            className="p-2 border rounded-lg"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="grass">Grass</option>
            <option value="electric">Electric</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paginatedPokemon.map((pokemon: any) => (
          <Card key={pokemon.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="capitalize">{pokemon.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-32 h-32 mx-auto"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {pokemon.types.map((type: any) => (
                  <span
                    key={type.type.name}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-center items-center space-x-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2 border rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p: any) => p + 1)}
          disabled={offset + itemsPerPage >= filteredPokemon.length}
          className="p-2 border rounded-lg disabled:opacity-50"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default PokemonApp;
