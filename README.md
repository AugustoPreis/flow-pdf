# Flow PDF

PDF generation library with a functional declarative API, built on top of PDFKit.

## Overview

Flow PDF is a TypeScript library that provides a functional, declarative API for generating PDFs, inspired by React.

## Installation

```bash
npm install
```

## Available Scripts

- `npm run build` – Compiles the project
- `npm run dev` – Runs the build in watch mode
- `npm test` – Runs the tests
- `npm run test:watch` – Runs tests in watch mode
- `npm run test:coverage` – Generates a test coverage report
- `npm run lint` – Runs the linter
- `npm run lint:fix` – Automatically fixes linting issues
- `npm run format` – Formats the code with Prettier
- `npm run format:check` – Checks formatting without modifying files
- `npm run typecheck` – Performs TypeScript type checking

## Architecture

The project follows a layered architecture:

1. **DSL (Domain-Specific Language)** – Public API and developer interface
2. **AST (Abstract Syntax Tree)** – Intermediate document representation
3. **Layout Engine** – Dimension and positioning calculations
4. **Renderer** – Transformation into drawing commands
5. **Pipeline** – Orchestration of the full workflow

## Project Structure

```
src/
├── core/         # Core types and fundamental structures
├── dsl/          # Public API
├── layout/       # Layout engine
├── renderer/     # Rendering layer
├── pipeline/     # Orchestration
└── utils/        # Utilities

tests/            # Unit and integration tests
docs/             # Documentation
```

## Project Status

This project is under active development. See [TODO.md](TODO.md) for the complete roadmap.

## License

MIT © Augusto Preis Tomasi
