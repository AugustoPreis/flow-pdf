# Guia Arquitetural: Biblioteca Declarativa de Geração de PDF

**Contexto**: Biblioteca de geração de PDF com API declarativa funcional, construída sobre PDFKit, inspirada em React (sem JSX).

**Objetivo**: Arquitetura escalável, manutenível e desacoplada para uma layout engine declarativa.

---

## 1. Estrutura do Projeto

### 1.1 Organização de Pastas

```
src/
├── core/
│   ├── types/           # TypeScript definitions centralizadas
│   │   ├── node.ts      # Tipos base de nós
│   │   ├── layout.ts    # Tipos relacionados a layout
│   │   ├── constraints.ts
│   │   └── index.ts
│   │
│   ├── node/            # Sistema de nós (AST)
│   │   ├── base-node.ts
│   │   ├── node-factory.ts
│   │   └── node-visitor.ts
│   │
│   └── context/         # Contexto de renderização
│       ├── render-context.ts
│       └── layout-context.ts
│
├── dsl/                 # Domain-Specific Language (API pública)
│   ├── index.ts         # Exports públicos
│   ├── elements/
│   │   ├── text.ts
│   │   ├── vStack.ts
│   │   ├── hStack.ts
│   │   └── index.ts
│   └── document/
│       └── pdf.ts       # Entry point principal
│
├── layout/              # Layout Engine
│   ├── engine/
│   │   ├── layout-engine.ts
│   │   ├── layout-pass.ts
│   │   └── constraint-solver.ts
│   │
│   ├── calculators/     # Cálculo específico por tipo de nó
│   │   ├── base-calculator.ts
│   │   ├── text-calculator.ts
│   │   ├── stack-calculator.ts
│   │   └── index.ts
│   │
│   └── models/          # Modelos de layout
│       ├── box-model.ts
│       ├── dimensions.ts
│       └── positioning.ts
│
├── renderer/            # Camada de renderização
│   ├── abstract/
│   │   ├── renderer-interface.ts
│   │   └── render-command.ts
│   │
│   ├── commands/        # Command Pattern para renderização
│   │   ├── base-command.ts
│   │   ├── text-command.ts
│   │   ├── rect-command.ts
│   │   └── index.ts
│   │
│   └── adapters/        # Adapters para diferentes backends
│       ├── pdfkit/
│       │   ├── pdfkit-adapter.ts
│       │   ├── pdfkit-commands.ts
│       │   └── pdfkit-context.ts
│       └── canvas/      # Futuro: debug em canvas HTML
│           └── canvas-adapter.ts
│
├── pipeline/            # Orquestração do fluxo
│   ├── pipeline.ts
│   ├── stages/
│   │   ├── validation-stage.ts
│   │   ├── layout-stage.ts
│   │   ├── render-stage.ts
│   │   └── pagination-stage.ts  # Futuro
│   └── middleware/
│       └── logger-middleware.ts
│
└── utils/               # Utilitários
    ├── validation/
    │   └── node-validator.ts
    ├── errors/
    │   ├── layout-error.ts
    │   └── validation-error.ts
    └── debug/
        └── tree-printer.ts

tests/
├── unit/
│   ├── dsl/
│   ├── layout/
│   └── renderer/
├── integration/
│   └── end-to-end/
└── fixtures/
    └── sample-documents/

docs/
├── architecture/
│   ├── ADR/             # Architecture Decision Records
│   │   ├── 001-ast-structure.md
│   │   ├── 002-layout-algorithm.md
│   │   └── 003-renderer-abstraction.md
│   └── diagrams/
└── api/
```

### 1.2 Separação de Responsabilidades (Camadas Arquiteturais)

#### **Camada 1: DSL (Domain-Specific Language)**

**Responsabilidade**: API pública, interface com o desenvolvedor final.

- Expõe funções puras que constroem nós da árvore
- Valida parâmetros básicos (types, required fields)
- Não conhece layout nem renderização
- Não tem side effects
- Retorna estruturas de dados imutáveis

**Por quê**: Separar a interface pública da implementação permite mudanças internas sem quebrar contratos. A DSL deve ser estável e intuitiva.

#### **Camada 2: AST (Abstract Syntax Tree)**

**Responsabilidade**: Representação intermediária da estrutura do documento.

- Estrutura de dados imutável
- Tipo de nó, propriedades, children
- Não sabe como será renderizado
- Pode ser serializada/deserializada (importante para futuro cache)
- Permite traversal, transformação e validação

**Por quê**: AST é a "single source of truth". Separar representação de execução permite múltiplos backends, otimizações, validações complexas e futuras features como hot-reload.

#### **Camada 3: Layout Engine**

**Responsabilidade**: Calcular dimensões, posições e quebras.

- Recebe AST, retorna Layout Tree (com dimensões e posições)
- Implementa algoritmo de layout (constraint solving)
- Resolve conflitos de espaço
- Calcula text wrapping, overflow
- Não conhece PDFKit ou qualquer backend
- Trabalha com abstrações: Box Model, Constraints, Dimensions

**Por quê**: Layout é a parte mais complexa. Isolá-lo permite testar sem dependências externas, reutilizar para outros backends (Canvas, SVG) e evoluir algoritmos independentemente.

#### **Camada 4: Renderer**

**Responsabilidade**: Transformar Layout Tree em comandos de desenho para o backend.

- Usa padrão Command para encapsular operações
- Adapter Pattern para PDFKit (e futuros backends)
- Não calcula layout, apenas executa
- Stateless: recebe instruções, executa

**Por quê**: Abstração de renderização é crítica. PDFKit pode ser substituído, pode-se adicionar preview em Canvas, ou até gerar SVG. Command Pattern permite undo/redo, logging, otimizações.

#### **Camada 5: Pipeline**

**Responsabilidade**: Orquestrar o fluxo completo.

- Coordena: DSL → AST → Layout → Render
- Gerencia contexto (página atual, fontes, estado)
- Aplica middleware (logging, validação, performance tracking)
- Trata erros globalmente
- Futuramente: gerencia paginação automática

**Por quê**: Pipeline centraliza o fluxo, tornando o sistema testável e extensível. Middleware permite adicionar features transversais sem modificar core.

### 1.3 Evitando Acoplamento ao PDFKit

**Problema**: PDFKit é uma dependência externa. Acoplar toda a lógica a ele dificulta testes, migração e evolução.

**Solução**:

1. **Interface Abstrata de Renderização**

   ```typescript
   interface RenderBackend {
     drawText(text: string, x: number, y: number, style: TextStyle): void;
     drawRect(
       x: number,
       y: number,
       width: number,
       height: number,
       style: RectStyle,
     ): void;
     createPage(size: PageSize): void;
     save(): Buffer;
   }
   ```

2. **Adapter Pattern**
   - `PDFKitAdapter implements RenderBackend`
   - Toda interação com PDFKit acontece apenas no adapter
   - Layout Engine e DSL não conhecem PDFKit

3. **Command Pattern**
   - Layout Engine emite Commands abstratos
   - Adapter traduz Commands para chamadas PDFKit
   - Desacopla "o que fazer" de "como fazer"

4. **Dependency Injection**
   - Pipeline recebe backend como parâmetro
   - Testes usam mock backend
   - Produção usa PDFKitAdapter

**Benefícios**:

- Testes rápidos sem I/O
- Possibilidade de preview em browser (Canvas API)
- Migração para outras libs (jsPDF, PDF-lib)
- Comparação de outputs entre backends

### 1.4 Preparando para Escalar

**Princípios**:

1. **Open/Closed Principle**
   - Aberto para extensão (novos elementos)
   - Fechado para modificação (core estável)

2. **Registry Pattern para Elementos**

   ```typescript
   class ElementRegistry {
     private calculators: Map<NodeType, LayoutCalculator>;
     private renderers: Map<NodeType, CommandRenderer>;

     register(
       type: NodeType,
       calculator: LayoutCalculator,
       renderer: CommandRenderer,
     ) {}
   }
   ```

   - Novos elementos são registrados, não hardcoded
   - Core não precisa conhecer todos os elementos

3. **Strategy Pattern para Layout**
   - Diferentes algoritmos (flexbox-like, grid-like)
   - Trocáveis por contexto

4. **Visitor Pattern para Traversal**
   - Percorrer árvore sem modificar nós
   - Adicionar operações (validação, otimização) sem alterar classes

5. **Plugin Architecture (futuro)**
   - Elementos customizados via plugins
   - Hooks em diferentes fases do pipeline

### 1.5 Adicionando Novos Elementos

**Processo**:

1. **Definir o Tipo do Nó** (`src/core/types/node.ts`)
   - Adicionar ao union type `NodeType`
   - Definir props específicas

2. **Criar DSL Function** (`src/dsl/elements/`)
   - Função pura que retorna o nó

3. **Implementar Layout Calculator** (`src/layout/calculators/`)
   - Extende `BaseCalculator`
   - Implementa `calculate(node, constraints): LayoutBox`

4. **Implementar Renderer** (`src/renderer/commands/`)
   - Cria Commands específicos
   - Adapter traduz para backend

5. **Registrar no Registry**
   - Uma chamada no bootstrap

**Exemplo Mental**: Adicionar `image()`

- DSL: `image(src, width?, height?)`
- Calculator: resolve dimensões, aspect ratio
- Renderer: comando `DrawImage`
- Adapter: chama `doc.image()`

### 1.6 Organização de Tipagens (TypeScript)

**Estratégia**:

1. **Tipos em `src/core/types/`**
   - Centralizados
   - Reutilizáveis
   - Versionados (branded types para breaking changes)

2. **Branded Types para Type Safety**

   ```typescript
   type LayoutBox = { _brand: 'LayoutBox'; x: number; y: number; ... };
   type RenderCommand = { _brand: 'RenderCommand'; type: string; ... };
   ```

   - Previne misturar conceitos
   - Compile-time safety

3. **Discriminated Unions para Nós**

   ```typescript
   type Node =
     | { type: 'text'; props: TextProps; ... }
     | { type: 'vStack'; props: StackProps; children: Node[]; ... }
   ```

   - Type narrowing automático
   - Exhaustiveness checking

4. **Generics para Extensibilidade**

   ```typescript
   interface Calculator<T extends Node> {
     calculate(node: T, constraints: Constraints): LayoutBox;
   }
   ```

5. **Strict Mode + No-Unchecked-Indexed-Access**
   - Evita undefined silencioso
   - Force null checks

6. **Utility Types**
   ```typescript
   type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
   type NodeProps<T extends NodeType> = Extract<Node, { type: T }>['props'];
   ```

**Por quê**: TypeScript bem usado previne 70% dos bugs. Tipos fortes transformam erros de runtime em erros de compilação. Investir em types early economiza meses de debug.

---

## 2. Passo a Passo Sequencial de Implementação

### **Fase 0: Fundação (Setup)**

#### 0.1 Setup do Projeto

- [x] Inicializar projeto TypeScript
- [x] Configurar `tsconfig.json` (strict mode, paths aliases)
- [x] Setup de testes (Vitest ou Jest)
- [x] Setup de linting (ESLint + Prettier)
- [x] Configurar build (esbuild ou tsup)
- [x] Criar estrutura de pastas

**Validação**: Build passa, testes rodam, types checam.

**Por quê primeiro**: Fundação sólida evita retrabalho. Configurar strict mode depois é doloroso.

---

### **Fase 1: Core Types & AST (MVP Essencial)**

#### 1.1 Definir Tipos Base

**Arquivos**: `src/core/types/*.ts`

- [x] Definir `Node` base type
- [x] Definir `NodeType` enum ou union
- [x] Definir `TextNode` e `TextProps`
- [x] Definir `VStackNode` e `StackProps`
- [x] Definir tipos de dimensões (`Width`, `Height`, `Point`)
- [x] Definir tipos de constraints (`Constraints`, `LayoutConstraints`)

**Validação**: Types compilam, são autoexplicativos. ✅

**Decisões Críticas**:

- **Imutabilidade**: Nodes devem ser readonly? **Sim**. Previne mutations acidentais, permite memoization.
- **Children como array ou linked list**: Array. Performance adequada, mais idiomático em JS.
- **Nominal vs Structural typing**: Structural com branded types para safety crítica.

**Por quê primeiro**: Types são o contrato. Defini-los primeiro força pensar na API antes da implementação.

---

#### 1.2 Implementar DSL Functions (Text e VStack)

**Arquivos**: `src/dsl/elements/text.ts`, `src/dsl/elements/vStack.ts`

- [x] Implementar `text(content: string, props?): TextNode`
- [x] Implementar `vStack(props, ...children): VStackNode`
- [x] Validações básicas (content não vazio, width positivo)
- [x] Testes unitários

**Validação**: ✅

```typescript
const node = vStack({ spacing: 8 }, text('Hello'), text('World'));
expect(node.type).toBe('vStack');
expect(node.children).toHaveLength(2);
```

**Erros Comuns**:

- Esquecer de congelar objetos (`Object.freeze`)
- Permitir children mutáveis
- Validação insuficiente (aceitar strings vazias)

**Por quê agora**: DSL é a interface. Implementar cedo permite testar ergonomia e iterar na API.

---

#### 1.3 Implementar Base Node e Node Factory

**Arquivos**: `src/core/node/base-node.ts`, `src/core/node/node-factory.ts`

- [x] Função para criar nós com defaults
- [x] Gerar IDs únicos para nós (importante para debug e React-like reconciliation futuro)
- [x] Helper para deep freeze
- [x] Helper para tree traversal

**Validação**: Consegue criar árvore, percorrê-la, garantir imutabilidade. ✅

**Por quê não antes**: DSL pode gerar nós diretamente inicialmente. Factory é refactoring para evitar duplicação.

---

### **Fase 2: Layout Engine MVP (Essencial)** ✅

#### 2.1 Definir Box Model

**Arquivos**: `src/layout/models/box-model.ts`

- [x] `LayoutBox`: posição (x, y), dimensões (width, height)
- [x] Margin, padding (futuro, mas reserve na interface)
- [x] Bounding box helpers

**Validação**: Criar LayoutBox, calcular intersections, containment. ✅

**Por quê**: Box Model é a linguagem do layout engine. Definir cedo evita refactorings massivos.

---

#### 2.2 Implementar LayoutEngine Base

**Arquivos**: `src/layout/engine/layout-engine.ts`

- [x] Classe/função que recebe AST e constraints
- [x] Retorna LayoutTree (AST + LayoutBox para cada nó)
- [x] Dispatch para calculators específicos

**Validação**: ✅

```typescript
const layoutTree = layoutEngine.layout(ast, { maxWidth: 500, maxHeight: 1000 });
expect(layoutTree.root.box.width).toBeLessThanOrEqual(500);
```

**Decisões Críticas**:

- **Single-pass ou multi-pass**: Começar single-pass (top-down). Multi-pass (medir, depois posicionar) é mais correto mas complexo.
- **Constraint propagation**: Parent constraints fluem para children. Children podem influenciar parent (grow)? No MVP, não.

**Implementado**: Single-pass top-down com dispatch para calculators específicos por tipo de nó.

---

#### 2.3 Implementar Text Calculator

**Arquivos**: `src/layout/calculators/text-calculator.ts`

- [x] Medir texto usando métricas de fonte
- [x] Calcular wrapping (quebra de linha)
- [x] Respeitar constraints de width
- [x] Calcular height baseado em linhas

**Validação**: Texto longo quebra corretamente, cabe no width constraint. ✅

**Desafios**:

- **Medição de texto**: PDFKit tem APIs de medição, mas queremos desacoplamento. Solução: abstrair font metrics.
- **Wrapping**: Algoritmo de quebra de linha (greedy? Knuth-Plass?). MVP: greedy (quebra na palavra).
- **Fontes**: Hardcoded inicialmente? Sim, uma fonte padrão.

**Implementado**: DefaultFontMetrics com algoritmo greedy de quebra de linha.

**Por quê agora**: Text é primitiva essencial. Sem ele, não há output visível.

---

#### 2.4 Implementar VStack Calculator

**Arquivos**: `src/layout/calculators/stack-calculator.ts`

- [x] Layout vertical: empilhar children
- [x] Respeitar `spacing`
- [x] Width: max dos children ou prop explícita
- [x] Height: soma dos children + spacing
- [x] Recursão: calcular children primeiro

**Validação**: Stack de 3 textos com spacing correto. ✅

**Decisões Críticas**:

- **Alignment**: Children ocupam full width ou se auto-dimensionam? MVP: full width.
- **Overflow**: Se children não cabem na height constraint? MVP: ignorar (overflow visível). Futuro: pagination.

**Implementado**: VStackCalculator e HStackCalculator com suporte a spacing, padding e dimensões explícitas.

---

#### 2.5 Implementar Calculators Adicionais

**Arquivos**: `src/layout/calculators/divider-calculator.ts`, `spacer-calculator.ts`, `box-calculator.ts`

- [x] Divider Calculator (horizontal/vertical)
- [x] Spacer Calculator (fixed e flex)
- [x] Box Calculator (com padding, border e children)

**Validação**: Todos os elementos DSL possuem calculators funcionais. ✅

**Implementado**: Calculators completos para todos os 6 tipos de nós: text, vStack, hStack, divider, spacer, box.

---

#### 2.6 Testes e Validação

**Arquivos**: `tests/unit/layout/*.test.ts`

- [x] Testes para Text Calculator (130 assertions)
- [x] Testes para Stack Calculators (164 assertions)
- [x] Testes para Layout Engine (200 assertions)
- [x] Testes para Element Calculators (204 assertions)

**Validação**: 293 testes passando com 90.5% de cobertura. ✅

**Build**: ESM (23.25 KB), CJS (24.98 KB), DTS (8.48 KB) ✅

**Lint**: Sem erros ✅

---

### **Fase 3: Renderer MVP (Essencial)**

#### 3.1 Definir Render Commands

**Arquivos**: `src/renderer/commands/base-command.ts`, `src/renderer/commands/text-command.ts`

- [x] Command interface: `execute(backend: RenderBackend)`
- [x] `TextCommand`: posição, conteúdo, estilo
- [x] `RectCommand`: debug (outline de boxes)

**Validação**: Criar command, executá-lo em mock backend.

**Por quê Command Pattern**:

- Comandos são dados, podem ser inspecionados, logged, otimizados
- Backend é injetado, testável
- Possibilita undo/redo, batching, diffing

---

#### 3.2 Implementar RenderBackend Interface

**Arquivos**: `src/renderer/abstract/renderer-interface.ts`

- [x] Definir interface mínima
- [x] `drawText()`, `drawRect()`, `createPage()`, `finalize()`
- [x] Mock implementation para testes

**Validação**: Mock backend registra chamadas corretamente.

---

#### 3.3 Implementar PDFKit Adapter

**Arquivos**: `src/renderer/adapters/pdfkit/pdfkit-adapter.ts`

- [x] Implements `RenderBackend`
- [x] Wrapper ao redor de `PDFDocument`
- [x] Traduz chamadas abstratas para API PDFKit
- [x] Gerencia estado interno (fonte, cor, etc.)

**Validação**: Gerar PDF real, abrir, visualizar.

**Desafios**:

- **Sistema de coordenadas**: PDFKit usa origin no top-left. Layout engine também? Sim, mantenha consistente.
- **Font loading**: PDFKit requer registrar fontes. Adapter responsável.
- **Streams**: PDFKit usa streams. Adapter encapsula.

**Erros Comuns**:

- Vazar abstrações do PDFKit (tipos, erros)
- Não tratar erros do PDFKit adequadamente

---

#### 3.4 Implementar Renderer

**Arquivos**: `src/renderer/renderer.ts`

- [x] Recebe LayoutTree
- [x] Gera Commands para cada nó
- [x] Dispatch: TextNode → TextCommand
- [x] Executa commands no backend

**Validação**: LayoutTree → Commands → PDF gerado corretamente.

---

### **Fase 4: Pipeline Integration (MVP Completo)**

#### 4.1 Implementar Pipeline

**Arquivos**: `src/pipeline/pipeline.ts`

- [x] Orquestra: DSL → Layout → Render
- [x] Cria contexto (página, configurações)
- [x] Tratamento de erros

**Validação**: End-to-end test: `pdf(vStack(...)) → Buffer`.

---

#### 4.2 Implementar Entry Point `pdf()`

**Arquivos**: `src/dsl/document/pdf.ts`

- [x] Função pública: `pdf(root: Node, config?: PdfConfig): Buffer`
- [x] Cria pipeline
- [x] Retorna buffer ou stream

**Validação**: API pública funcionando conforme spec do usuário.

**Decisões Críticas**:

- **Síncrono ou assíncrono**: PDFKit pode ser assíncrono (streams). MVP: síncrono (buffer). Futuro: async.
- **Config**: Page size, margins, fonts. MVP: defaults hardcoded.

---

#### 4.3 Testes End-to-End

**Arquivos**: `tests/integration/basic-document.test.ts`

- [x] Gerar PDF com VStack + Text
- [x] Validar buffer não vazio
- [x] (Opcional) Parsear PDF e validar conteúdo

**Validação**: `npm test` passa. PDF gerado abre sem erros.

---

### **MVP CHECKPOINT**

**O que você tem**:

- API funcional: `pdf(vStack(...text...))`
- Layout básico: empilhamento vertical
- Output: PDF real via PDFKit

**O que falta (fora do MVP)**:

- Paginação
- Elementos complexos (image, table, hStack)
- Estilos avançados (borders, backgrounds)
- Performance otimizada
- Tratamento de erros robusto

---

### **Fase 5: Expandindo Elementos (Pós-MVP)**

#### 5.1 Implementar HStack

- [ ] Horizontal layout calculator
- [ ] Width distribution (equal? grow?)
- [ ] Alignment (top, center, bottom)

**Desafios**:

- Distribuir width disponível entre children
- Conflito quando soma dos children > constraint

---

#### 5.2 Implementar Container (Box)

- [ ] Padding, margin
- [ ] Background color
- [ ] Borders

**Por quê**: Abstração para layout com espaçamento.

---

#### 5.3 Implementar Image

- [ ] Carregar image (file, URL, buffer)
- [ ] Calcular aspect ratio
- [ ] Resize strategies (fit, fill, stretch)

**Desafios**: Loading assíncrono, validações.

---

### **Fase 6: Paginação (Crítico para Escalabilidade)**

#### 6.1 Implementar Pagination Stage

**Arquivos**: `src/pipeline/stages/pagination-stage.ts`

- [ ] Detectar overflow vertical
- [ ] Quebrar LayoutTree em múltiplas páginas
- [ ] Lidar com elementos não quebráveis (images)
- [ ] Orphans e widows (tipografia)

**Validação**: Documento longo gera múltiplas páginas automaticamente.

**Desafios Críticos**:

- **Onde quebrar**: Entre nós? Dentro de texto? Algoritmo complexo.
- **Header/Footer**: Elementos repetidos por página.
- **Estado entre páginas**: Numeração, contexto.

**Por quê depois do MVP**: Paginação é complexa e pode ser feita manualmente inicialmente (múltiplas chamadas `pdf()`).

---

### **Fase 7: Performance & Otimização (Após Funcionalidade Completa)**

#### 7.1 Memoização de Layout

- [ ] Cache de cálculos de layout
- [ ] Invalidation: só recalcular subárvore modificada

**Por quê depois**: Otimização prematura é raiz do mal. Ter benchmarks antes.

---

#### 7.2 Lazy Loading de Fontes e Imagens

- [ ] Carregar recursos sob demanda
- [ ] Pool de recursos

---

#### 7.3 Streaming de Output

- [ ] Não acumular todo PDF em memória
- [ ] Streaming direto para file system

**Por quê depois**: MVP precisa de simplicidade. Streaming adiciona complexidade.

---

### **Fase 8: Extensibilidade Avançada (Longo Prazo)**

#### 8.1 Plugin System

- [ ] Registro de elementos customizados
- [ ] Hooks no pipeline
- [ ] Temas (preset de estilos)

---

#### 8.2 Suporte a Múltiplos Backends

- [ ] Canvas Adapter (preview no browser)
- [ ] SVG Adapter (output vetorial para web)
- [ ] Comparação de outputs (testes visuais)

---

#### 8.3 Dev Tools

- [ ] Tree viewer (debug de AST)
- [ ] Layout inspector (visualizar boxes)
- [ ] Performance profiler

---

### **Checklist de Validação por Fase**

| Fase | Validação Mínima                  | Bloqueador para Próxima Fase? |
| ---- | --------------------------------- | ----------------------------- |
| 0    | Build + testes rodam              | Sim                           |
| 1    | Criar AST programaticamente       | Sim                           |
| 2    | LayoutTree com dimensões corretas | Sim                           |
| 3    | PDF gerado e visualizável         | Sim                           |
| 4    | API pública funciona              | Sim                           |
| 5    | Novos elementos funcionam         | Não                           |
| 6    | Documentos multi-página           | Não                           |
| 7    | Benchmarks mostram melhoria       | Não                           |
| 8    | Plugins funcionam                 | Não                           |

---

## 3. Explicações Técnicas Profundas

### 3.1 Por Que Separar AST de Layout Tree?

**Problema**: É tentador calcular layout durante construção da árvore (eager evaluation).

**Por que não fazer isso**:

1. **Reusabilidade**: Mesma AST pode gerar layouts diferentes (page sizes diferentes)
2. **Otimização**: Pode-se transformar/otimizar AST antes de layout (flatten, deduplicate)
3. **Debugging**: AST é inspecionável, Layout Tree também, separadamente
4. **Testabilidade**: Layout logic isolada, testável com fixtures
5. **Reconciliation futura**: Se quiser hot-reload ou diff, precisa de AST separada

**Princípio**: Separation of Concerns. Representação vs Computação.

**Erro Comum**: Misturar. Exemplo: `text('Hello')` já calcular width. Parece simples, mas:

- Requer contexto (fonte, page size)
- Impede reutilizar node
- Torna testes dependentes de PDFKit

**Decisão**: AST é dados puros. Layout é computação pura (pure function: AST + Constraints → LayoutTree).

---

### 3.2 Layout Algorithm: Single-Pass vs Multi-Pass

**Single-Pass (Top-Down)**:

- Parent define constraints, children calculam dentro dessas constraints
- Simples, rápido
- Não permite children influenciarem parent (e.g., texto crescer e expandir container)

**Multi-Pass (Measure + Layout)**:

- Pass 1: Children reportam tamanho ideal (unconstrained)
- Pass 2: Parent distribui espaço, children layoutam
- Complexo, mas mais flexível (como Android Views)

**Decisão MVP**: Single-pass.

- Suficiente para VStack simples
- Parent define width, children herdam

**Futuro**: Hybrid. Alguns elementos (texto) precisam measure pass.

**Implementação**:

```typescript
// Single-pass
function layout(node: Node, constraints: Constraints): LayoutBox {
  const calculator = getCalculator(node.type);
  return calculator.calculate(node, constraints);
}

// Multi-pass (futuro)
function layout(node: Node, constraints: Constraints): LayoutBox {
  const size = measure(node, constraints);
  return position(node, size, constraints);
}
```

**Por quê**: Começar simples, evoluir quando necessário. Multi-pass é prematuro no MVP.

---

### 3.3 Constraint Solving: Flexbox Simplificado

**Problema**: Layout não é trivial. CSS Flexbox levou anos para especificar.

**Estratégia**: Subset simplificado.

**MVP Constraints**:

- `maxWidth`: Largura máxima disponível
- `maxHeight`: Altura máxima disponível (ignorado inicialmente)

**VStack rules**:

1. Width do stack = prop explícita OU max dos children OU maxWidth
2. Cada child usa width do stack como constraint
3. Height do stack = soma dos children + spacing

**Exemplo**:

```
vStack({ width: 300, spacing: 8 },
  text('Hello'),  // width=300 (herdado), height=20 (calculado)
  text('World')   // width=300, height=20
)
// Stack: width=300, height=48 (20+8+20)
```

**Futuro**: Grow, shrink, alignment, min/max constraints.

**Implementação**:

```typescript
class VStackCalculator {
  calculate(node: VStackNode, constraints: Constraints): LayoutBox {
    const stackWidth = node.props.width ?? constraints.maxWidth;

    const childConstraints = { maxWidth: stackWidth, maxHeight: Infinity };
    const childBoxes = node.children.map((child) =>
      layout(child, childConstraints),
    );

    const stackHeight = childBoxes.reduce(
      (sum, box, i) => sum + box.height + (i > 0 ? node.props.spacing : 0),
      0,
    );

    return { width: stackWidth, height: stackHeight, x: 0, y: 0 };
  }
}
```

**Erro Comum**: Tentar implementar Flexbox completo. É enorme. Crescer incrementalmente.

---

### 3.4 Text Wrapping: Greedy vs Optimal

**Problema**: Quebrar texto em linhas respeitando width.

**Greedy Algorithm** (MVP):

- Adiciona palavras até não caber
- Quebra linha
- Simples, rápido, mas não ideal visualmente

**Knuth-Plass Algorithm** (TeX):

- Minimiza "badness" global (espaços irregulares)
- Complexo, lento, mas perfeito
- Usado em TeX, InDesign

**Decisão MVP**: Greedy.

- Suficiente para 95% dos casos
- Performance previsível

**Futuro**: Knuth-Plass como opt-in para texto longo.

**Implementação Greedy**:

```typescript
function wrapText(
  text: string,
  maxWidth: number,
  measureFn: (s: string) => number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (measureFn(testLine) <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
```

**Desafio**: `measureFn` precisa de font metrics. Solução: FontMetrics abstrato, implementado por adapter.

---

### 3.5 Font Metrics Abstraction

**Problema**: Medir texto requer informações de fonte (char widths, height, kerning).

**PDFKit**: Tem APIs (`doc.widthOfString()`), mas isso acopla Layout Engine ao PDFKit.

**Solução**: Abstrair.

```typescript
interface FontMetrics {
  measureText(text: string, fontSize: number): Dimensions;
  getLineHeight(fontSize: number): number;
}

class PDFKitFontMetrics implements FontMetrics {
  constructor(private pdfDoc: PDFDocument) {}

  measureText(text: string, fontSize: number): Dimensions {
    return {
      width: this.pdfDoc.widthOfString(text, { fontSize }),
      height: this.pdfDoc.currentLineHeight(),
    };
  }
}
```

**Layout Engine recebe** `FontMetrics`, não PDFKit.

**Benefícios**:

- Testes usam mock metrics (retornam valores fixos)
- Canvas backend usa `measureText()` do Canvas
- Previsível, testável

**Trade-off**: Medir texto sem PDFKit instanciado é difícil. Soluções:

1. Layout Engine recebe FontMetrics do Pipeline (que tem acesso ao backend)
2. Usar biblioteca de parsing de fontes (opentype.js) - overhead
3. Aproximações (char médio \* count) - impreciso

**Decisão**: Layout precisa do backend para métricas. Injetar via contexto.

```typescript
const layoutContext = {
  fontMetrics: backend.getFontMetrics(),
  constraints: { maxWidth: 500 },
};

const layoutTree = layoutEngine.layout(ast, layoutContext);
```

**Implicação**: Layout não é 100% backend-agnostic, mas a interface é.

---

### 3.6 Command Pattern vs Direct Rendering

**Abordagem 1: Renderização Direta**

```typescript
function render(layoutTree: LayoutTree, pdfDoc: PDFDocument) {
  layoutTree.nodes.forEach((node) => {
    if (node.type === 'text') {
      pdfDoc.text(node.content, node.box.x, node.box.y);
    }
  });
}
```

Simples, mas:

- Acoplamento direto
- Não testável sem PDFKit
- Não permite otimizações (batching, deduplication)
- Não permite preview

**Abordagem 2: Command Pattern** (recomendado)

```typescript
interface RenderCommand {
  execute(backend: RenderBackend): void;
}

class TextCommand implements RenderCommand {
  constructor(
    private text: string,
    private x: number,
    private y: number,
    private style: TextStyle,
  ) {}

  execute(backend: RenderBackend) {
    backend.drawText(this.text, this.x, this.y, this.style);
  }
}

function render(layoutTree: LayoutTree): RenderCommand[] {
  return layoutTree.nodes.map((node) => {
    if (node.type === 'text') {
      return new TextCommand(node.content, node.box.x, node.box.y, node.style);
    }
  });
}

// Uso
const commands = render(layoutTree);
commands.forEach((cmd) => cmd.execute(pdfkitBackend));
```

**Benefícios**:

- Commands são dados, inspecionáveis
- Testável: assert commands gerados
- Backend intercambiável
- Otimizações: merge commands, skip redundant
- Logging: dump commands para debug
- Serialização: salvar commands, replay

**Custo**: Mais código, indireção.

**Decisão**: Vale a pena. Fundamental para extensibilidade.

---

### 3.7 Pagination: O Problema Mais Difícil

**Desafio**: Documentos longos precisam múltiplas páginas. Como quebrar automaticamente?

**Problema 1: Onde Quebrar?**

- Entre elementos? Sim, ideal.
- Dentro de texto? Necessário se texto longo.
- Dentro de imagem? Não, fica horrível.
- Dentro de table? Complexo (repetir headers).

**Problema 2: Elementos Não Quebráveis**

- Container com border não pode quebrar (senão border fica aberto)
- Solução: Mark elementos como `breakable: boolean`

**Problema 3: Orphans e Widows**

- Orphan: Primeira linha de parágrafo sozinha no fim da página
- Widow: Última linha sozinha no início da página
- Tipografia correta evita isso
- Requer lookahead

**Problema 4: Header/Footer**

- Cada página precisa de elementos fixos (page number, logo)
- Layout engine precisa reservar espaço
- Requer API para definir template de página

**Problema 5: Estado Entre Páginas**

- Numeração de páginas: `Page X of Y`
- Requer conhecer total antes de renderizar
- Conflita com streaming

**Algoritmo Simplificado (MVP futuro)**:

```typescript
function paginate(layoutTree: LayoutTree, pageHeight: number): Page[] {
  const pages: Page[] = [];
  let currentPage: LayoutNode[] = [];
  let currentY = 0;

  for (const node of layoutTree.nodes) {
    if (currentY + node.box.height > pageHeight) {
      // Página cheia
      pages.push({ nodes: currentPage });
      currentPage = [];
      currentY = 0;
    }
    currentPage.push(node);
    currentY += node.box.height;
  }

  if (currentPage.length > 0) {
    pages.push({ nodes: currentPage });
  }

  return pages;
}
```

**Limitações**:

- Não quebra elementos (se elemento > pageHeight, overflow)
- Não respeita orphans/widows
- Não lida com headers/footers

**Evolução**:

1. MVP: Sem paginação (responsabilidade do usuário)
2. V2: Paginação simples (quebra entre elementos)
3. V3: Quebra dentro de texto
4. V4: Headers/footers
5. V5: Orphans/widows, keep-together

**Por quê deixar para depois**: Paginação é 50% da complexidade. Funcionalidade básica primeiro, paginação depois.

---

### 3.8 Imutabilidade e Performance

**Imutabilidade**: Nós e LayoutBoxes devem ser imutáveis.

**Benefícios**:

- Previne bugs (mutation acidental)
- Permite memoização (cache seguro)
- Facilita debugging (estado não muda sob os pés)
- Possibilita time-travel debugging

**Custos**:

- Mais garbage collection
- Clonagem ao modificar

**Estratégia**:

1. **Shallow freeze** objetos (`Object.freeze()`)
2. **Structural sharing**: Ao modificar, reusa subárvores não modificadas
3. **Immer.js (opcional)**: Simplifica criação de cópias imutáveis

**Exemplo**:

```typescript
// Ruim: mutação
function addChild(stack: VStackNode, child: Node) {
  stack.children.push(child); // MUTAÇÃO!
}

// Bom: imutável
function addChild(stack: VStackNode, child: Node): VStackNode {
  return {
    ...stack,
    children: [...stack.children, child],
  };
}
```

**Performance**: Imutabilidade tem overhead. Mas:

- Geração de PDF não é real-time (latência de centenas de ms é ok)
- Benefícios de corretude > micro-otimizações
- Se virar gargalo, otimizar depois

**Quando otimizar**: Após profiling mostrar problema. Não antes.

---

### 3.9 Error Handling Strategy

**Tipos de Erros**:

1. **Validation Errors**: Node inválido (width negativo, children vazio quando requerido)
2. **Layout Errors**: Constraints impossíveis (elemento requer 1000px em página de 500px)
3. **Render Errors**: PDFKit falhou (fonte não encontrada, I/O error)
4. **Configuration Errors**: Config inválida (page size inválido)

**Estratégia**:

**Fail-Fast para Validation**:

- Validar na DSL (ao construir nó)
- Throw se inválido
- Usuário deve corrigir

```typescript
export function vStack(props: StackProps, ...children: Node[]): VStackNode {
  if (children.length === 0) {
    throw new ValidationError('vStack requires at least one child');
  }
  if (props.spacing < 0) {
    throw new ValidationError('spacing must be non-negative');
  }
  // ...
}
```

**Graceful Degradation para Layout**:

- Layout impossível? Overflow (render assim mesmo, avisar)
- Warning, não exception

```typescript
function layout(node: Node, constraints: Constraints): LayoutBox {
  const box = calculate(node, constraints);
  if (box.width > constraints.maxWidth) {
    console.warn(
      `Node ${node.type} overflows constraint (${box.width} > ${constraints.maxWidth})`,
    );
  }
  return box;
}
```

**Exception para Render Errors**:

- Erro de I/O, fonte missing: não tem recovery
- Throw, propagar

**Custom Error Classes**:

```typescript
class LayoutEngineError extends Error {
  constructor(
    message: string,
    public node: Node,
    public context: any,
  ) {
    super(message);
  }
}
```

Incluir contexto (node, constraints) facilita debug.

**Futuro**: Validation stage no pipeline, acumular erros, reportar todos de uma vez.

---

### 3.10 Testing Strategy

**Pirâmide de Testes**:

1. **Unit Tests (70%)**
   - DSL functions
   - Layout calculators
   - Command generation
   - Mocks para backends

2. **Integration Tests (20%)**
   - Pipeline completo
   - AST → PDF buffer
   - Fixtures de documentos

3. **E2E Tests (10%)**
   - Gerar PDF, abrir em leitor
   - Visual regression (snapshot de imagens)

**Unit Test Example**:

```typescript
describe('VStackCalculator', () => {
  it('should layout children vertically with spacing', () => {
    const node = vStack({ spacing: 8 }, text('A'), text('B'));
    const constraints = { maxWidth: 100, maxHeight: 1000 };

    const mockFontMetrics = {
      measureText: () => ({ width: 50, height: 20 }),
    };

    const calculator = new VStackCalculator(mockFontMetrics);
    const box = calculator.calculate(node, constraints);

    expect(box.height).toBe(48); // 20 + 8 + 20
  });
});
```

**Integration Test Example**:

```typescript
describe('pdf generation', () => {
  it('should generate valid PDF buffer', () => {
    const doc = vStack({ spacing: 10 }, text('Title'), text('Content'));

    const buffer = pdf(doc);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    // Opcional: validar estrutura do PDF
    expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
  });
});
```

**Visual Regression Testing** (avançado):

- Gerar PDF, converter para PNG (pdf-to-png)
- Comparar com snapshot (jest-image-snapshot)
- Detecta regressões visuais

**Snapshot Testing de AST**:

```typescript
it('should generate correct AST', () => {
  const node = vStack({ spacing: 8 }, text('Hello'));
  expect(node).toMatchSnapshot();
});
```

Garante API estável.

**Por quê muitos unit tests**: Layout engine é complexo, muitas edge cases. Cada bug vira teste.

---

### 3.11 API Design: Ergonomia vs Flexibilidade

**Tensão**: API simples vs poderosa.

**Exemplo**:

```typescript
// Simples, mas limitado
text('Hello');

// Poderoso, mas verboso
text({ content: 'Hello', fontSize: 12, color: '#000' });
```

**Solução**: Overloads + Defaults.

```typescript
export function text(content: string): TextNode;
export function text(content: string, props: Partial<TextProps>): TextNode;
export function text(
  contentOrProps: string | TextProps,
  props?: Partial<TextProps>,
): TextNode {
  // Normalizar inputs
  // ...
}
```

**Defaults Inteligentes**:

- `fontSize`: 12
- `color`: black
- `width`: inherit from parent

**Builder Pattern (alternativa)**:

```typescript
text('Hello').fontSize(14).color('blue').build();
```

Mais fluida, mas requer mutação interna ou imutabilidade complexa.

**Decisão MVP**: Functions com props opcionais. Simples, funciona bem.

**Futuro**: Preset de estilos (temas).

```typescript
const theme = { text: { fontSize: 14, color: 'blue' } };
pdf(doc, { theme });
```

---

### 3.12 Versionamento e Breaking Changes

**Problema**: Biblioteca evoluirá. Como gerenciar?

**Semantic Versioning**:

- Major: breaking changes
- Minor: novos features, backward compatible
- Patch: bugfixes

**Estratégias**:

**1. Deprecation Path**

```typescript
/**
 * @deprecated Use vStack with alignment prop instead
 */
export function vStackCentered(...children: Node[]): VStackNode {
  console.warn('vStackCentered is deprecated');
  return vStack({ alignment: 'center' }, ...children);
}
```

**2. Feature Flags**

```typescript
pdf(doc, { features: { experimentalPagination: true } });
```

Permite testar features beta sem quebrar prod.

**3. Branded Types para Versioning**

```typescript
type NodeV1 = { _version: 1; type: string; ... };
type NodeV2 = { _version: 2; type: string; props: Record<string, any>; ... };

type Node = NodeV1 | NodeV2;
```

Pipeline detecta versão, trata apropriadamente.

**4. Migrations**

```typescript
function migrateV1toV2(nodeV1: NodeV1): NodeV2 {
  // Transform
}
```

**Quando fazer breaking changes**:

- Major version bumps
- Com guia de migração
- Após deprecation period (2-3 minor versions)

**Por quê cedo**: Definir estratégia de versionamento antes de launch evita lock-in.

---

### 3.13 Documentação e DX (Developer Experience)

**Problema**: Biblioteca complexa precisa docs excelentes.

**Tipos de Documentação**:

**1. README**

- Quick start (10 linhas de código)
- Installation
- Basic examples

**2. API Reference**

- Gerada do código (TypeDoc)
- Tipos anotados (JSDoc)

````typescript
/**
 * Creates a vertical stack layout.
 *
 * @param props - Stack configuration
 * @param children - Child nodes to stack
 * @returns VStackNode
 *
 * @example
 * ```ts
 * vStack({ spacing: 8 }, text('A'), text('B'))
 * ```
 */
export function vStack(props: StackProps, ...children: Node[]): VStackNode;
````

**3. Guides**

- Conceitos (AST, Layout, Rendering)
- Patterns comuns
- Troubleshooting

**4. Migration Guides**

- Entre versões

**5. Architecture Decision Records (ADRs)**

- Decisões técnicas documentadas
- `docs/architecture/ADR/001-ast-structure.md`

**6. Examples Repository**

- Documentos reais (invoice, report, resume)
- Copy-paste friendly

**DX Enhancements**:

- **TypeScript autocomplete**: Tipos bem definidos
- **Error messages claras**: Incluir sugestões
  ```
  Error: vStack requires at least one child.
  Did you mean to use container() instead?
  ```
- **Debug mode**: `pdf(doc, { debug: true })` → dump AST, LayoutTree
- **Playground online**: Web editor para testar (futuro)

**Por quê investir**: DX é diferencial. Biblioteca poderosa com DX ruim não é adotada.

---

## 4. Considerações Extras

### 4.1 Estratégia de Testes

**Objetivos**:

1. Confiança: Mudanças não quebram funcionalidade
2. Documentação: Testes como examples
3. Regressão: Bugs não reaparecem
4. Performance: Detectar degradação

**Tipos de Testes**:

**Unit Tests**:

- Framework: Vitest (rápido, moderno) ou Jest
- Cobertura: >80% para core (layout, renderer)
- Mocks: Backend, FontMetrics
- Fast: Suite completa < 5s

**Integration Tests**:

- Pipeline completo
- Fixtures: Documentos reais
- Assertions: Buffer válido, dimensões corretas
- Snapshot: AST e Commands

**Visual Regression**:

- Ferramentas: Percy, Chromatic, ou jest-image-snapshot
- Process: PDF → PNG → Diff
- CI: Block merge se visual diff não aprovado
- Trade-off: Lento, mas detecta quebras visuais

**Performance Tests**:

- Benchmark: Tempo de geração
- Alertar se regressão > 20%
- Tools: Benchmark.js, tinybench

**Mutation Testing** (avançado):

- Ferramentas: Stryker
- Muta código, verifica se testes pegam
- Valida qualidade dos testes

**Test Coverage Goals**:

- Core (layout, AST): 90%+
- DSL: 80%+
- Adapters: 70%+ (inclui PDFKit real)

**CI/CD**:

- GitHub Actions, GitLab CI
- Rodar testes em PR
- Gerar coverage report
- Block merge se < threshold

**Por quê rigor**: Layout bugs são sutis. Testes previnem frustração de usuários.

---

### 4.2 Estratégia de Versionamento

**Semver Estrito**:

- `MAJOR.MINOR.PATCH`
- Major: Breaking API changes
- Minor: New features, backward compatible
- Patch: Bugfixes

**Pre-releases**:

- `1.0.0-alpha.1`: Experimental, API instável
- `1.0.0-beta.1`: Feature complete, testing
- `1.0.0-rc.1`: Release candidate

**Branch Strategy**:

- `main`: Stable, sempre deployable
- `develop`: Integração, próximo release
- `feature/*`: Features isoladas
- `bugfix/*`: Hotfixes

**Changelog**:

- Automatizado (conventional-commits)
- Sections: Added, Changed, Deprecated, Removed, Fixed, Security

**Release Process**:

1. Feature freeze em `develop`
2. Create release branch `release/1.2.0`
3. Bump version em `package.json`
4. Update CHANGELOG
5. Merge para `main` (tag `v1.2.0`)
6. Deploy para npm
7. Merge back para `develop`

**Deprecation Policy**:

- Avisar 2 minor versions antes de remover
- Runtime warnings
- Docs claras

**LTS (Long-Term Support)**:

- Versões major anteriores: apenas bugfixes críticos por 6 meses
- Exemplo: v2.x lançada → v1.x vira LTS

**Por quê estrutura**: Projetos dependentes precisam estabilidade. Sem processo, breaking changes causam caos.

---

### 4.3 Estratégia de Performance

**Premissa**: "Premature optimization is the root of all evil" - Knuth.

**Abordagem**:

1. **Measure First**: Profiling antes de otimizar
2. **Optimize Bottlenecks**: Pareto (80% tempo em 20% código)
3. **Validate**: Benchmark antes/depois

**Áreas de Performance**:

**1. Layout Calculation**

- Bottleneck: Recursão, recalcular subárvores
- Otimização: Memoização

  ```typescript
  const layoutCache = new Map<Node, LayoutBox>();

  function layout(node: Node, constraints: Constraints): LayoutBox {
    const key = `${node.id}-${JSON.stringify(constraints)}`;
    if (layoutCache.has(key)) return layoutCache.get(key);
    // ...
  }
  ```

- Trade-off: Memória vs CPU

**2. Text Wrapping**

- Bottleneck: Medir cada substring
- Otimização: Approximação (avg char width), refinar só se necessário
- Binary search para wrap point

**3. Font Loading**

- Problema: Carregar fontes repetidamente
- Solução: Pool de fontes, lazy loading

  ```typescript
  class FontPool {
    private loaded = new Map<string, Font>();

    async load(name: string): Promise<Font> {
      if (!this.loaded.has(name)) {
        this.loaded.set(name, await loadFont(name));
      }
      return this.loaded.get(name);
    }
  }
  ```

**4. Rendering**

- Problema: Muitas chamadas pequenas ao PDFKit
- Solução: Batching (agrupar drawText chamadas)
- Trade-off: Complexidade

**5. Memory**

- Problema: Grandes PDFs em memória
- Solução: Streaming
  ```typescript
  function pdf(root: Node, output: WriteStream): void {
    // Render direto para stream, não buffer
  }
  ```

**Benchmarking**:

```typescript
import { bench } from 'vitest';

bench('layout 1000 nodes', () => {
  const doc = vStack({}, ...Array(1000).fill(text('Test')));
  layoutEngine.layout(doc, constraints);
});
```

**Performance Budgets**:

- Simple doc (10 elements): < 50ms
- Medium doc (100 elements): < 200ms
- Large doc (1000 elements): < 2s

CI alerta se budget excedido.

**Por quê não no MVP**: Performance otimização é iterativa. Primeiro funcionar, depois otimizar.

---

### 4.4 Estratégia para Paginação Automática

**Visão**: Usuário define documento, biblioteca pagina automaticamente.

**Desafios** (já discutidos): Onde quebrar, elementos não-quebráveis, headers/footers.

**Arquitetura**:

**1. Pagination Stage no Pipeline**

```typescript
function paginate(layoutTree: LayoutTree, config: PageConfig): Page[] {
  // Split LayoutTree em múltiplas páginas
}
```

**2. Page Template**

```typescript
interface PageTemplate {
  header?: Node;
  footer?: Node;
  marginTop: number;
  marginBottom: number;
}
```

Usuário define:

```typescript
pdf(doc, {
  pageTemplate: {
    header: text('Company Name', { alignment: 'center' }),
    footer: text('Page {{pageNumber}} of {{totalPages}}'),
  },
});
```

**3. Breakable Marker**

```typescript
interface BreakableProps {
  breakable?: boolean; // Default: depende do elemento
  keepTogether?: boolean; // Forçar não quebrar
}
```

**4. Orphan/Widow Control**

```typescript
interface TextProps {
  orphans?: number; // Min lines end of page (default: 2)
  widows?: number; // Min lines start of page (default: 2)
}
```

**Algoritmo**:

1. Layout documento como página infinita
2. Iterar LayoutTree:
   - Se elemento cabe na página atual: adicionar
   - Se não cabe:
     - Se breakable: quebrar
     - Se não: mover para próxima página
3. Aplicar header/footer a cada página
4. Second pass: Resolver variáveis dinâmicas (`{{pageNumber}}`)

**Complexidade**: Alta. Por isso é Fase 6, não MVP.

**Alternativa Simples (MVP)**:

```typescript
// Usuário controla paginação
const page1 = pdf(vStack(...));
const page2 = pdf(vStack(...));
```

Menos mágico, mas funciona.

**Por quê importante**: Paginação automática é feature killer para adoção.

---

### 4.5 Evolução para "React Native para PDF"

**Visão de Longo Prazo**: Biblioteca comparável a React Native ou Flutter, mas para PDF.

**Features Futuras**:

**1. Componentes**

```typescript
function Invoice({ items, total }) {
  return vStack({},
    text('Invoice', { fontSize: 24 }),
    table({ data: items }),
    text(`Total: ${total}`, { fontSize: 18 })
  );
}

pdf(Invoice({ items: [...], total: 100 }));
```

Componente = função que retorna Node.

**2. Hooks (Context, State)**

```typescript
function Header() {
  const theme = useTheme();
  return text('Title', { color: theme.primary });
}
```

Context para passar dados (theme, config) sem prop drilling.

**3. Reconciliation (Hot Reload)**

- Diff entre ASTs
- Re-renderizar só diff
- Útil para preview em tempo real

**4. Reactive (Data Binding)**

```typescript
const data = reactive({ items: [...] });

const doc = vStack({},
  text(() => `Items: ${data.items.length}`)
);

// Auto-regenera quando data.items muda
```

Similar a Vue ou MobX.

**5. Layout Inspectors, Dev Tools**

- Visual debugger (como React DevTools)
- Inspecionar AST, Layout, Commands
- Time-travel debugging

**6. Ecosystem**

- Component library (charts, tables, widgets)
- Templates (invoice, resume, report)
- Themes

**Como Chegar Lá**:

**Fase Atual (MVP)**: Functional DSL
**Fase 2**: Componentização (funções reutilizáveis)
**Fase 3**: Context API
**Fase 4**: Reactive rendering
**Fase 5**: Dev tools

**Inspirações Arquiteturais**:

- **React**: Component model, reconciliation
- **Flutter**: Layout algorithm (RenderBox), constraints
- **Yoga**: Flexbox implementation
- **React PDF**: Conceito, mas melhor arquitetura

**Trade-offs**:

- Complexidade aumenta exponencialmente
- Manter simplicidade do core
- Features avançadas via plugins, não core

**Por quê plausível**: Arquitetura proposta (AST, Layout Engine, Pipeline) já é base para isso. Evolução incremental.

---

### 4.6 Considerações de Deployment

**Packaging**:

- Bundle: esbuild ou tsup
- Output: CommonJS (Node) + ESM
- `package.json`:
  ```json
  {
    "main": "./dist/index.cjs",
    "module": "./dist/index.mjs",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "require": "./dist/index.cjs",
        "import": "./dist/index.mjs",
        "types": "./dist/index.d.ts"
      }
    }
  }
  ```

**Tree Shaking**:

- ESM permite tree shaking
- Usuário importa só o necessário
- Reduz bundle size

**Peer Dependencies**:

- PDFKit como peer (usuário instala)
- Reduz conflitos de versão
- Ou: bundle PDFKit (mais simples, mais pesado)

**Browser Support**:

- PDFKit funciona no browser (com browserify)
- Considerar: Adapter para Canvas (preview sem PDFKit)

**CDN**:

- Publicar em unpkg, jsDelivr
- UMD build para browsers

**Instalação**:

```bash
npm install flow-pdf pdfkit
```

**Exemplo Usage**:

```typescript
import { pdf, vStack, text } from 'flow-pdf';
const buffer = pdf(vStack({}, text('Hello')));
```

---

### 4.7 Considerações de Segurança

**Ataques Potenciais**:

**1. Injection (conteúdo malicioso)**

- Usuário passa string com caracteres especiais
- Solução: Sanitização/escaping
- PDFKit geralmente safe, mas validar

**2. Resource Exhaustion (DoS)**

- Documento com 1 milhão de nós
- Solução: Limites

  ```typescript
  const MAX_NODES = 10000;

  function validateTree(node: Node): void {
    let count = 0;
    traverse(node, () => count++);
    if (count > MAX_NODES) throw new Error('Document too large');
  }
  ```

**3. Font Exploits**

- Carregar fontes de URLs maliciosas
- Solução: Whitelist de fontes, validar formato

**4. Path Traversal (se salvar arquivos)**

- Usuário passa `../../etc/passwd` como filename
- Solução: Validação de paths

**Best Practices**:

- Validar inputs cedo
- Limites de recursos
- Sanitização de strings
- Deps auditadas (`npm audit`)

**Por quê considerar**: Biblioteca será usada em servidores. Bugs de segurança = vulnerabilidades críticas.

---

### 4.8 Monitoramento e Observabilidade (Produção)

**Problema**: Usuários usarão em produção. Como diagnosticar problemas?

**Estratégias**:

**1. Logging**

- Estruturado (JSON)
- Níveis (debug, info, warn, error)
- Configurável
  ```typescript
  pdf(doc, { logLevel: 'debug' });
  ```

**2. Metrics**

- Tempo de layout
- Tempo de render
- Tamanho de documentos
- Expor via callback
  ```typescript
  pdf(doc, {
    onMetrics: (metrics) => {
      console.log(`Layout: ${metrics.layoutTime}ms`);
    },
  });
  ```

**3. Error Tracking**

- Integração com Sentry, Rollbar
- Capturar stack traces, contexto (AST, constraints)

**4. Telemetria (opcional, opt-in)**

- Coletar uso anônimo (elementos mais usados)
- Ajuda priorizar features

**5. Health Checks**

- Função para validar setup
  ```typescript
  healthCheck().then((status) => console.log(status));
  // { pdfkit: 'ok', fonts: 'ok', ... }
  ```

**Por quê em biblioteca**: Usuários rodarão em ambientes variados. Observabilidade facilita suporte.

---

### 4.9 Community & Open Source

**Se Open Source**:

**Governança**:

- License: MIT (permissiva) ou Apache 2.0
- Contributing guide
- Code of conduct
- Issue templates (bug, feature request)
- PR template (checklist: tests, docs)

**Roadmap Público**:

- GitHub Projects
- Transparência sobre próximas features
- Aceitar contribuições

**Communication**:

- Discord, Slack ou GitHub Discussions
- Responses rápidas (< 48h)

**Recognition**:

- Contributors list
- Highlight PRs

**Sponsorship**:

- GitHub Sponsors, Open Collective
- Sustentar manutenção

**Por quê importante**: Comunidade ativa = evolução rápida, mais testes, adoção.

---

### 4.10 Licenciamento e Compliance

**Biblioteca**:

- MIT License (recomendado): Permissiva, amigável comercialmente

**Dependencies**:

- Auditar licenses de deps
- PDFKit: MIT (safe)
- Fontkit, etc.: Verificar

**Fonts**:

- Fontes têm licenses (OFL, proprietary)
- Documentar quais fontes podem ser usadas
- Não incluir fontes proprietárias

**Compliance**:

- Se library for usada em SaaS, considerar GDPR (se processar dados pessoais)
- PDFs podem conter metadata (criador, timestamps): Opção de remover

**Por quê**: Problemas legais podem inviabilizar uso corporativo.

---

### 4.11 Exemplo de Architecture Decision Record (ADR)

**Template**:

```markdown
# ADR 001: Separar AST de Layout Tree

## Status

Accepted

## Context

Layout engine precisa calcular posições e dimensões dos elementos. Podemos:

1. Calcular durante construção da árvore (eager)
2. Separar representação (AST) de computação (LayoutTree)

## Decision

Separar AST de LayoutTree.

## Consequences

**Positivos**:

- Mesma AST pode gerar layouts diferentes (page sizes)
- Layout testável isoladamente
- Possibilita otimizações (cache, transformações)

**Negativos**:

- Mais código
- Indireção (dois passes)

## Alternatives Considered

- Eager evaluation: Simples, mas impede reutilização e otimizações.
```

ADRs documentam "por que" decisões foram tomadas. Invaluável meses depois.

---

### 4.12 Migration Path (Caso Exista Solução Anterior)

Se usuários já usam outra lib (react-pdf, pdfmake), facilite migração:

**1. Compatibility Layer**

```typescript
// Emula API de react-pdf
import { Document, Page, Text } from 'flow-pdf/compat/react-pdf';
```

**2. Migration Guide**

- Comparação lado a lado
- Scripts automatizados (codemods)

**3. Gradual Adoption**

- Interop: Renderizar parte com antiga lib, parte com nova

**Por quê**: Switching cost alto = barreira de entrada. Facilitar migração = mais adoção.

---

### 4.13 Checklist de Pré-Launch

Antes de 1.0.0:

- [ ] API estável, sem breaking changes esperadas
- [ ] Docs completas (README, guides, API reference)
- [ ] Exemplos funcionais
- [ ] Testes com boa cobertura
- [ ] CI/CD configurado
- [ ] Benchmarks baseline
- [ ] Changelog estruturado
- [ ] Issue tracker configurado
- [ ] License clara
- [ ] Security policy (como reportar vulnerabilidades)
- [ ] Testado em múltiplas plataformas (Node versions, OSes)
- [ ] Performance aceitável (benchmarks vs expectations)
- [ ] Error messages úteis
- [ ] TypeScript types corretos
- [ ] Zero deps vulneráveis (`npm audit`)

---

## Conclusão

Você agora tem um guia arquitetural completo para construir uma biblioteca robusta de geração de PDF.

**Princípios Chave**:

1. **Separação de responsabilidades**: DSL, AST, Layout, Render são independentes
2. **Desacoplamento**: PDFKit é apenas um adapter, pode ser substituído
3. **Testabilidade**: Cada camada testável isoladamente
4. **Extensibilidade**: Novos elementos via registry, não hardcoding
5. **Imutabilidade**: Previne bugs, permite otimizações
6. **Progressão incremental**: MVP primeiro, features avançadas depois

**Sequência de Implementação**:

1. Fundação (types, AST)
2. Layout Engine (calculators)
3. Renderer (commands, PDFKit adapter)
4. Pipeline (orquestração)
5. Expansão (novos elementos)
6. Paginação (complexo, depois)
7. Otimização (performance)
8. Extensibilidade (plugins, ecosystem)

**Prazo Estimado** (desenvolvedor experiente):

- **MVP (Fase 0-4)**: 2-3 semanas
- **Elementos adicionais (Fase 5)**: 1-2 semanas
- **Paginação (Fase 6)**: 2-4 semanas
- **Polimento (Fase 7-8)**: Contínuo

**Investimento Vale a Pena?**
Se o objetivo é construir uma solução profissional, escalável e manutenível: **absolut sim**.

Atalhos (acoplar ao PDFKit, sem abstração) economizam 30% de tempo inicial, mas custam 300% em manutenção e evolução.

**Próximos Passos**:

1. Setup projeto (Fase 0)
2. Implementar types base (Fase 1.1)
3. Implementar DSL para text e vStack (Fase 1.2)
4. Seguir checklist sequencial

Boa sorte construindo essa engine. Arquitetura sólida + execução disciplinada = biblioteca de classe mundial. 🚀

---

**Última Revisão**: 2026-02-24  
**Autor**: Arquiteto Sênior (AI Assistant)  
**Versão do Guia**: 1.0
