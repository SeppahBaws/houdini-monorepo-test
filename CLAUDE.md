# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Setup
- `pnpm i` - Install all dependencies
- `pnpm build` - Build all packages and apps

### Development
- `pnpm dev` - Start development server for all apps (primarily the web app)
- `pnpm sandbox` - Run the UI library sandbox for component development
- `pnpm lint` - Run linting across all packages
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Run TypeScript type checking

### Testing
- `cd apps/web && npm run test` - Run both unit and integration tests for web app
- `cd apps/web && npm run test:unit` - Run unit tests with Vitest
- `cd apps/web && npm run test:integration` - Run integration tests with Playwright
- `cd packages/ui && npm run test` - Run UI library tests

### Single Package Development
- `cd apps/web && npm run dev` - Web app development server
- `cd packages/ui && npm run sandbox` - UI component sandbox
- `cd packages/ui && npm run dev` - Watch mode for UI library building

## Architecture

This is a pnpm monorepo using Turborepo for task orchestration with the following structure:

### Core Technologies
- **SvelteKit** - Main application framework (Svelte 5)
- **Houdini** - GraphQL client with code generation and caching
- **TypeScript** - Type safety across all packages
- **Vite** - Build tool and development server
- **Turborepo** - Monorepo task runner and caching

### Package Structure
- `apps/web/` - Main SvelteKit application consuming Rick and Morty GraphQL API
- `packages/ui/` - Shared Svelte component library with Houdini integration
- `packages/eslint-config/` - Shared ESLint configuration
- `packages/typescript-config/` - Shared TypeScript configurations

### Key Integration Points

#### Houdini GraphQL Setup
- Schema source: Rick and Morty API (`https://rickandmortyapi.com/graphql`)
- Runtime directory: `.houdini` (contains generated types and runtime)
- The UI package acts as a Houdini plugin providing shared GraphQL components
- Components can use `graphql()` for queries and `@load` directive for SSR

#### Workspace Dependencies
- UI library is consumed via `@repo/ui` workspace reference
- Shared configs via `@repo/eslint-config` and `@repo/typescript-config`
- All packages use workspace protocol for internal dependencies

#### Development Environment
- Nix flake provides Node.js 24 and pnpm
- direnv integration via `.envrc`
- Turborepo handles build dependencies and caching

### GraphQL Patterns
- `.gql` files for page-level queries (e.g., `+page.gql`)
- Inline `graphql()` calls in components for component-specific queries
- Type-safe generated interfaces for all GraphQL operations
- Automatic query variables via exported `_VariableFunctions`