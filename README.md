# TypeScript + Cli + Rest API + React App Mono Repository

This is a template for a monorepo that uses best practices for TypeScript, Web Services and React.

It is what @melvillian considers best practice in February 2025.

This app is maintained in part by https://mycoder.ai

## Features

- Mono-repository using bun workspaces
- TypeScript for type safety
- ES Modules for fast builds
- NodeNext node resolution
- React for UI
- Tailwindcss for styling
- Both react and vanilla JS libraries
- Command line, React app, and web server
- Vite for Bundling, CSS Handling, Live Reloading
- CLI via commander + file commands
- @TanStack/start for router, SSR, server API
- Fastify for server with file-based router
- Hot reload of React
- Auto service restart for the web server
- Prettier for code formatting
- ESLint for linting
- VSCode will auto-format on save and paste
- Vitest for testing with coverage support
- Github action CI

## Getting Started

1. Clone this repository
2. Run `bun install`

### Tests

1. Run `bun run test` to run all tests
2. Run `bun run test:watch` for watch mode during development
3. Run `bun run test:coverage` to generate test coverage report

### Continuous Dev Build

1. Run `bun run dev` to start the hot reload development server & build watchers

### Optimized Production Build

1. Run `bun run build` to build the source

### Command Line

1. Run `bun run cli` to run the CLI example
