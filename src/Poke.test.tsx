import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import PokemonApp from "./Poke";

// Mock fetch globally
global.fetch = jest.fn();

// Sample mock data
const mockPokemonList = {
  results: [
    { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
    { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4/" },
    { name: "squirtle", url: "https://pokeapi.co/api/v2/pokemon/7/" },
  ],
};

const mockPokemonDetails = [
  {
    id: 1,
    name: "bulbasaur",
    types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
    sprites: { front_default: "bulbasaur.png" },
  },
  {
    id: 4,
    name: "charmander",
    types: [{ type: { name: "fire" } }],
    sprites: { front_default: "charmander.png" },
  },
  {
    id: 7,
    name: "squirtle",
    types: [{ type: { name: "water" } }],
    sprites: { front_default: "squirtle.png" },
  },
];

describe("PokemonApp", () => {
  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  describe("Initial Loading", () => {
    it("shows loading state initially", () => {
      // Mock the initial fetch to delay resolution
      jest
        .spyOn(global, "fetch")
        .mockImplementation(jest.fn(() => new Promise(() => {})));

      render(<PokemonApp />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("fetches and displays Pokemon successfully", async () => {
      // Mock successful API responses
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPokemonList),
        })
      );

      // Mock individual Pokemon detail fetches
      mockPokemonDetails.forEach((pokemon) => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(pokemon),
          })
        );
      });

      render(<PokemonApp />);

      // Wait for Pokemon cards to appear
      await waitFor(() => {
        expect(screen.getByText("bulbasaur")).toBeInTheDocument();
        expect(screen.getByText("charmander")).toBeInTheDocument();
        expect(screen.getByText("squirtle")).toBeInTheDocument();
      });
    });

    it("handles API error gracefully", async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      );

      render(<PokemonApp />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to fetch Pokemon list/i)
        ).toBeInTheDocument();
      });
    });

    it("handles partial Pokemon fetch failures", async () => {
      // Mock successful initial fetch
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPokemonList),
        })
      );

      // Mock mixed success/failure for individual Pokemon
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() =>
          // Success
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPokemonDetails[0]),
          })
        )
        .mockImplementationOnce(() =>
          // Failure
          Promise.reject(new Error("Failed to fetch charmander"))
        )
        .mockImplementationOnce(() =>
          // Success
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPokemonDetails[2]),
          })
        );

      render(<PokemonApp />);

      await waitFor(() => {
        expect(screen.getByText("bulbasaur")).toBeInTheDocument();
        expect(screen.getByText("squirtle")).toBeInTheDocument();
        expect(
          screen.getByText(/Failed to load 1 Pokemon/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    beforeEach(async () => {
      // Setup successful API responses
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPokemonList),
          })
        )
        .mockImplementation((url: string) => {
          const pokemon = mockPokemonDetails.find((p) =>
            url.includes(p.id.toString())
          );
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(pokemon),
          });
        });

      render(<PokemonApp />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("bulbasaur")).toBeInTheDocument();
      });
    });

    it("filters Pokemon by search term", async () => {
      const searchInput = screen.getByPlaceholderText(/search pokemon/i);
      await userEvent.type(searchInput, "char");

      expect(screen.getByText("charmander")).toBeInTheDocument();
      expect(screen.queryByText("bulbasaur")).not.toBeInTheDocument();
      expect(screen.queryByText("squirtle")).not.toBeInTheDocument();
    });

    it("shows no results message when search has no matches", async () => {
      const searchInput = screen.getByPlaceholderText(/search pokemon/i);
      await userEvent.type(searchInput, "xyz");

      expect(screen.getByText("No Pokemon found")).toBeInTheDocument();
    });
  });

  describe("Filtering Functionality", () => {
    beforeEach(async () => {
      // Setup successful API responses
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPokemonList),
          })
        )
        .mockImplementation((url: string) => {
          const pokemon = mockPokemonDetails.find((p) =>
            url.includes(p.id.toString())
          );
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(pokemon),
          });
        });

      render(<PokemonApp />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("bulbasaur")).toBeInTheDocument();
      });
    });

    it("filters Pokemon by type", async () => {
      const typeFilter = screen.getByRole("combobox", { name: /filter/i });
      await userEvent.selectOptions(typeFilter, "fire");

      expect(screen.getByText("charmander")).toBeInTheDocument();
      expect(screen.queryByText("bulbasaur")).not.toBeInTheDocument();
      expect(screen.queryByText("squirtle")).not.toBeInTheDocument();
    });
  });

  describe("Sorting Functionality", () => {
    beforeEach(async () => {
      // Setup successful API responses
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPokemonList),
          })
        )
        .mockImplementation((url: string) => {
          const pokemon = mockPokemonDetails.find((p) =>
            url.includes(p.id.toString())
          );
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(pokemon),
          });
        });

      render(<PokemonApp />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("bulbasaur")).toBeInTheDocument();
      });
    });

    it("sorts Pokemon in ascending order by default", () => {
      const pokemonNames = screen
        .getAllByRole("heading")
        .map((h) => h.textContent);
      expect(pokemonNames).toEqual(["bulbasaur", "charmander", "squirtle"]);
    });

    it("sorts Pokemon in descending order when selected", async () => {
      const sortSelect = screen.getByRole("combobox", { name: /sort/i });
      await userEvent.selectOptions(sortSelect, "desc");

      const pokemonNames = screen
        .getAllByRole("heading")
        .map((h) => h.textContent);
      expect(pokemonNames).toEqual(["squirtle", "charmander", "bulbasaur"]);
    });
  });

  describe("Pagination", () => {
    beforeEach(async () => {
      // Create larger mock data for pagination testing
      const largeMockList = {
        results: Array.from({ length: 25 }, (_, i) => ({
          name: `pokemon${i + 1}`,
          url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
        })),
      };

      const largeMockDetails = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `pokemon${i + 1}`,
        types: [{ type: { name: "normal" } }],
        sprites: { front_default: "sprite.png" },
      }));

      // Setup successful API responses
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(largeMockList),
          })
        )
        .mockImplementation(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(largeMockDetails[0]),
          })
        );

      render(<PokemonApp />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("pokemon1")).toBeInTheDocument();
      });
    });

    it("shows correct number of Pokemon per page", () => {
      const pokemonCards = screen.getAllByRole("heading");
      expect(pokemonCards).toHaveLength(20); // itemsPerPage is set to 20
    });

    it("navigates to next page", async () => {
      const nextButton = screen.getByRole("button", { name: /next/i });
      await userEvent.click(nextButton);

      expect(screen.getByText("Page 2")).toBeInTheDocument();
    });

    it("disables previous button on first page", () => {
      const prevButton = screen.getByRole("button", { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });
  });
});
