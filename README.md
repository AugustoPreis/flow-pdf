# Flow PDF

Biblioteca de geração de PDF com API declarativa funcional, construída sobre PDFKit.

## Visão Geral

Flow PDF é uma biblioteca TypeScript que oferece uma API declarativa e funcional para geração de PDFs, inspirada em React.

## Instalação

```bash
npm install
```

## Scripts Disponíveis

- `npm run build` - Compila o projeto
- `npm run dev` - Roda o build em modo watch
- `npm test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura de testes
- `npm run lint` - Executa o linter
- `npm run lint:fix` - Corrige problemas de linting automaticamente
- `npm run format` - Formata o código com Prettier
- `npm run format:check` - Verifica formatação sem modificar
- `npm run typecheck` - Verifica tipos TypeScript

## Arquitetura

O projeto segue uma arquitetura em camadas:

1. **DSL (Domain-Specific Language)** - API pública e interface com o desenvolvedor
2. **AST (Abstract Syntax Tree)** - Representação intermediária do documento
3. **Layout Engine** - Cálculo de dimensões e posicionamento
4. **Renderer** - Transformação em comandos de desenho
5. **Pipeline** - Orquestração do fluxo completo

## Estrutura do Projeto

```
src/
├── core/         # Tipos e estruturas fundamentais
├── dsl/          # API pública
├── layout/       # Engine de layout
├── renderer/     # Camada de renderização
├── pipeline/     # Orquestração
└── utils/        # Utilitários

tests/            # Testes unitários e integração
docs/             # Documentação
```

## Status do Projeto

Este projeto está em desenvolvimento ativo. Veja [TODO.md](TODO.md) para o roadmap completo.

## Licença

MIT © Augusto Preis Tomasi
