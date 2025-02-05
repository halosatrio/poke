# Pokemon Explorer Application

- deployed and hosted on my private server. you can access it via this link:
  - **https://poke.bayubit.com**
- you can read the codebase on my github repository:
  - **https://github.com/halosatrio/poke**

## Libraries and Frameworks Used

- React
- TypeScript
- shadcn/ui
- Tailwind

reason: simplicity. doesn't use next.js because it's overkill. simple React + Vite is enough for small project like this.

## Component Structure and State Management

### Component Architecture

implemented a modular component structure following these principles:

1. **Main Component (`PokemonApp`)**

   - Manages core application state
   - Handles API interactions
   - Contains main layout structure

2. **State Management**

   - Used React's built-in hooks for state management

   ```ts
   const [pokemon, setPokemon] = useState<PokemonDetail[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [failedPokemon, setFailedPokemon] = useState<FailedPokemon[]>([]);
   ```

   - Separated concerns into distinct state variables
   - Used TypeScript for type safety

3. **Scalability Considerations**
   - Components are modular and reusable
   - State logic is centralized
   - TypeScript interfaces ensure type safety

## Error Handling and Edge Cases

We implemented comprehensive error handling:

1. **API Error Handling**

   ```ts
   try {
     const response = await fetch(url);
     if (!response.ok) throw new Error("Failed to fetch Pokemon");
   } catch (err) {
     setError(err instanceof Error ? err.message : "An unknown error occurred");
   }
   ```

2. **Partial Failure Handling**

   - Used `Promise.allSettled` for individual Pokemon fetches
   - Tracks failed fetches separately
   - Displays successful data even when some requests fail

3. **Edge Cases**
   - Loading states
   - Empty results handling

## Testing Strategy

Implemented comprehensive testing using React Testing Library:

```typescript
describe("PokemonApp", () => {
  it("shows loading state initially", () => {
    render(<PokemonApp />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
```

## Data Validation

**Type Safety**

```ts
interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonType[];
  sprites: PokemonSprites;
}
```

## User Interface Design

- Used shadcn/ui for consistent design
- Responsive design layout
- Clear loading states
- Error feedback
- Intuitive navigation

## Advanced Features Implementation

1. **Pagination**

   ```ts
   const itemsPerPage = 20;
   const offset = (page - 1) * itemsPerPage;
   const paginatedPokemon = filteredPokemon.slice(
     offset,
     offset + itemsPerPage
   );
   ```

2. **Search**

   - Real-time search functionality

3. **Sorting & Filtering**
   - Type-based filtering
   - Combinable filter and sorting

## Deployment and Monitoring

### Deployment Strategy

#### How I deploy this app

- using docker:
  - build the docker image
  - copy the docker image to my server
- using trafeik (reverse proxy):
  - edit file `docker-compose.yaml` to include new service (this app)
  - start the docker compose

#### Docker alternative:

- build using `pnpm run build`, deploy on vps using tools like `nginx` and `pm2` as webserver and reverse proxy

### Monitoring

1. **Performance Monitoring**

   - React Developer Tools
   - Lighthouse scores
   - Core Web Vitals

2. **Error Monitoring**

   - Console error logging
   - API error tracking

3. **Usage Analytics**
   - Umami
   - google analytics
