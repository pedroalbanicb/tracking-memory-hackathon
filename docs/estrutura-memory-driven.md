---
tags: [meta, arquitetura, memory-driven, copilot, workspace, hackathon]
tipo: meta-doc
status: draft
updated: 2026-04-15
autor: GitHub Copilot
fonte: "Análise automática do workspace em 2026-04-15 — 5 iterações completas"
---

# Método: Memory-Driven Development — Como Este Workspace Funciona

> Documento gerado por análise automática detalhada do workspace (5 iterações).
> Descreve o método de funcionamento real e propõe melhorias estruturadas.

---

## 1. Visão Geral do Método

Este workspace emprega um padrão chamado **Memory-Driven Development**: um repositório central de conhecimento (vault Obsidian) atua como fonte de verdade do domínio, e os projetos de execução (API e Frontend) são guiados por esse conhecimento — especialmente via customizações de IA (GitHub Copilot agents, skills e instructions).

```
┌─────────────────────────────────────────────────────────────────┐
│             tracking-memory-hackathon  (VAULT)                  │
│                                                                 │
│  Conhecimento         Contratos          Operação               │
│  ─────────────        ─────────          ─────────              │
│  SKILL.md             PRD-001/002        CHECKLIST-DIARIO       │
│  E01–E09 docs         ADR-001/002        PENDENCIAS             │
│  docs/conceitos/      RFC/               discovery-status       │
│  mapeamento-arquivos  epico-jira-tasks   mapeamento-arquivos    │
│                                                                 │
│  ↓ skills/instructions        ↓ contratos        ↓ docs         │
└──────────────┬────────────────────┬────────────────┬────────────┘
               │                    │                │
               ▼                    ▼                ▼
   ┌───────────────────┐   ┌──────────────┐   ┌───────────────┐
   │  gestaoproduto-   │   │  gestaoprod. │   │  Jira TCD     │
   │  plataforma-api   │   │  plataforma- │   │  Board 2291   │
   │  (.NET 8 BFF)     │   │  web (React) │   │               │
   │                   │   │              │   │               │
   │  - SKILL.md ativa │   │  ⚠️ SEM link  │   │  TCD-9910     │
   │  - 4 agents       │   │  ⚠️ SEM skill │   │  TCD-9934     │
   │  - 5 instructions │   │  ⚠️ SEM agent │   │               │
   └───────────────────┘   └──────────────┘   └───────────────┘
```

---

## 2. Fluxo Detalhado por Camada

### 2.1 Vault → API (fluxo mais maduro)

| Artefato na Vault | Como chega na API | Mecanismo |
|---|---|---|
| `SKILL.md` (tracking-go-domain) | Declarado em `.github/copilot-instructions.md` da API | `<skill>` tag + path crossrepo |
| `ADR-002` (contrato do endpoint) | Dev lê e implementa `POST /api/v1/tracking/skus/listar` | Humano mediado |
| `PRD-002` (colunas da listagem) | Dev implementa o payload de resposta | Humano mediado |
| `E01–E09 docs` | SKILL.md carrega contexto de cada etapa | IA mediado via skill |
| `docs-conventions.instructions.md` | Não referenciado pela API | ❌ Não chegа |

**Mecanismo principal:** `dev.agent.md` declara `tracking-go-domain` como skill e define ordem de precedência:
1. `instructions/*.instructions.md` (local)
2. `agents/dev.agent.md` (local)
3. `skills/tracking-go-domain/SKILL.md` (crossrepo — vault)

### 2.2 Vault → Frontend (fluxo QUEBRADO)

O repositório `gestaoproduto-plataforma-web` contém apenas `.git/`. Nenhuma customização Copilot existe:

- Nenhum `.github/copilot-instructions.md`
- Nenhum agent, skill ou instruction
- Nenhuma referência ao `SKILL.md` do vault
- PRD-002 (que define 13 colunas da UI) está apenas na vault

**Consequência:** Qualquer dev trabalhando no frontend tem zero contexto de domínio assistido por IA. As regras de E01-E09, os nomes dos campos, as restrições de exibição — tudo invisível.

### 2.3 Vault → Jira (fluxo parcial)

| Artefato | Conexão Jira | Qualidade |
|---|---|---|
| `epico-tasks-api-tracking-fase-1-graphql.md` | Mapeia TCD-9934 e subtasks | ✅ Explícito |
| `PRD-002` | Sem campo `jira-task` no frontmatter | ⚠️ Implícito |
| `ADR-002` | Sem campo `jira-task` no frontmatter | ⚠️ Implícito |
| `E01–E09 docs` | Sem referência de task | ❌ Nenhuma |
| Convenção de commit `[TCD-XXXX]` | Definida nos dois repos | ✅ Consistente |

---

## 3. Análise das 5 Iterações

### Iteração 1 — Fluxo memory → projetos

**Achado:** O fluxo vault → API é bem estruturado e deliberado. A skill `tracking-go-domain` é o principal vetor de injeção de conhecimento. O `dev.agent.md` define regras de precedência explícitas, o que evita conflitos entre convenções locais e domínio.

**Risco identificado:** A skill é carregada **sob demanda** (não automaticamente). Se o dev não mencionar tracking no chat, a skill não é ativada e todo o contexto de E01-E09 fica invisível para a IA.

---

### Iteração 2 — Gaps de sincronização

**Achados:**

1. `docs/api/tracking-graphql-mercadorias-fase-1.md` (na API) e `SKILL.md` (na vault) documentam o mesmo endpoint GraphQL de forma independente. São a mesma informação com granularidades diferentes — sem mecanismo de sync.

2. `mock/data.json` (vault) é a referência de dados mock do frontend, mas o frontend não referencía esse arquivo programaticamente.

3. `graphql-response.schema.json` (vault/scripts/) define o schema da resposta GraphQL mas não é usado nos testes da API.

4. O arquivo `overview.html` e `mock/index.html` são interfaces visuais standalone que não são consumidas pelo projeto frontend real.

---

### Iteração 3 — Consistência de contratos

**Achado — três rastreadores de status paralelos:**

| Arquivo | O que rastreia | Atualização |
|---|---|---|
| `SKILL.md` | Status por etapa E01-E09 (tabela) | Manual |
| `discovery-status.md` | Status detalhado por etapa com gaps | Manual |
| `overview.html` | Status visual (cores/ícones) | Manual |

Qualquer mudança de status exige atualizações em **3 lugares** sem verificação cruzada. Já ocorreu divergência: `overview.html` tinha E07→E08 errado, corrigido em 10/04.

**Achado — chain de contratos sem status formal:**

```
PRD-002 (draft) → ADR-002 (Proposed) → implementação → frontend
```

Nenhum contrato tem campo `jira-task` no frontmatter. A rastreabilidade Jira ↔ decisão arquitetural é puramente convencional.

---

### Iteração 4 — Rastreabilidade Jira ↔ docs ↔ código

**Achado — planejamento da API na vault:**

`docs/epico-tasks-api-tracking-fase-1-graphql.md` mapeia tasks Jira para a API mas **vive na vault**, não no repositório da API. Quando a API for implementada, não há ponteiro de volta (`// Implementa TCD-9937` no código).

**Achado — PRDs e ADRs sem campo Jira:**

Campos de frontmatter existentes: `tags`, `status`, `data`, `autores`, `rfc-relacionada`.
Campo ausente: `jira-task: TCD-XXXX`.

**Ponto positivo:** Convenção de commit `[TCD-XXXX]` está definida nos dois repos de código e na vault. É um dos poucos mecanismos de rastreabilidade bidirecional.

---

### Iteração 5 — Automação e pontos cegos

**Ponto cego 1 — Verificação de integridade manual:**

`mapeamento-arquivos.md` é um inventário humano do vault. Qualquer arquivo novo cria drift imediato. Não existe script que valide wikilinks, frontmatter obrigatório ou datas de `updated` estagnadas.

**Ponto cego 2 — Scripts de teste orphans:**

`scripts/test-graphql.js` e `test-graphql.py` testam a query GraphQL de forma ad-hoc. Não são referenciados em CI da API, não usam o `graphql-response.schema.json` do mesmo diretório, e não têm plano de integração com os testes xUnit da API.

**Ponto cego 3 — PENDENCIAS.md vs CHECKLIST-DIARIO.md:**

Dois arquivos rastreiam itens abertos com sobreposição de propósito. `CHECKLIST-DIARIO.md` tem estrutura por prioridade e responsável; `PENDENCIAS.md` também. Manutenção duplicada sem regra clara de quando usar cada um.

**Ponto cego 4 — referencias-confluence.md cria confusão de fonte:**

Enquanto a vault substitui o Confluence como fonte de verdade, `referencias-confluence.md` ainda linkeia para páginas Confluence sem indicar se estão obsoletas ou ainda são autoritativas para stakeholders externos. Para time externo, qual é a fonte canônica?

**Ponto cego 5 — Nenhum mecanismo de "skill staleness":**

Se a API adiciona um novo endpoint ou a Juliana confirma como E06/E07 funciona, não existe gatilho para atualizar o `SKILL.md`. A skill pode ficar desatualizada silenciosamente.

---

## 4. Melhorias Propostas

### P1 — Críticas (impacto imediato)

#### M01 — Adicionar customização Copilot no Frontend

**Problema:** `gestaoproduto-plataforma-web` tem zero contexto de domínio para IA.

**Ação:** Criar `.github/copilot-instructions.md` no frontend com referência à skill `tracking-go-domain` do vault e às regras do PRD-002.

```
gestaoproduto-plataforma-web/
└── .github/
    ├── copilot-instructions.md   ← referenciar skill do vault
    └── instructions/
        └── frontend.instructions.md  ← componentes, contrato de API
```

**Esforço:** Baixo. **Impacto:** Alto.

---

#### M02 — Unificar rastreador de status E01-E09

**Problema:** Status duplicado em `SKILL.md`, `discovery-status.md`, e `overview.html`.

**Ação:** Eleger `discovery-status.md` como fonte de verdade de status. `SKILL.md` e `overview.html` referenciam ou derivam dele. Criar convenção: qualquer mudança de status começa em `discovery-status.md`.

**Alternativa:** Script que lê `discovery-status.md` e gera a tabela do `SKILL.md` e o HTML automaticamente.

**Esforço:** Médio. **Impacto:** Alto (elimina divergências).

---

### P2 — Importantes (próximo sprint)

#### M03 — Adicionar campo `jira-task` no frontmatter de ADRs e PRDs

**Problema:** Rastreabilidade ADR/PRD ↔ Jira é puramente humana.

**Ação:** Adicionar ao template de ADR e PRD:

```yaml
jira-task: TCD-XXXX
jira-epic: TCD-9910
```

E ao template de etapa (`E0N-*`):

```yaml
jira-task-discovery: TCD-XXXX
jira-task-impl: TCD-XXXX
```

**Esforço:** Baixo. **Impacto:** Médio.

---

#### M04 — Mover `epico-tasks-api-tracking-fase-1-graphql.md` para a API

**Problema:** Planejamento de tasks de implementação da API vive na vault, não na API.

**Ação:** Mover para `gestaoproduto-plataforma-api/docs/planning/` e criar um link na vault:

```markdown
→ Planejamento de implementação: ver repositório da API em `docs/planning/`
```

**Alternativa:** Manter na vault mas criar `docs/planning/` e separar "decisão de domínio" (vault) de "planejamento de implementação" (repo do projeto).

**Esforço:** Baixo. **Impacto:** Médio (separa responsabilidades de repos).

---

#### M05 — Resolver PENDENCIAS.md + CHECKLIST-DIARIO.md

**Problema:** Dois arquivos com propósito similar sem regra de uso.

**Ação:** Definir responsabilidade clara:
- `CHECKLIST-DIARIO.md` → itens em andamento no dia (apagados quando fechados)
- `PENDENCIAS.md` → backlog de longo prazo pendente de SME/decisão

**Alternativa:** Consolidar em `PENDENCIAS.md` com seções `Em andamento` e `Backlog`.

**Esforço:** Baixo. **Impacto:** Baixo, mas reduz overhead diário.

---

### P3 — Nice-to-have (backlog)

#### M06 — Script de integridade do vault

**Problema:** `mapeamento-arquivos.md` diverge quando arquivos são criados/removidos.

**Ação:** Script `scripts/check-vault.js` que:
1. Resolve todos os `[[wikilinks]]` e reporta quebrados
2. Verifica se todos os `.md` têm frontmatter obrigatório (`tags`, `status`, `updated`)
3. Lista arquivos com `updated` > 30 dias sem modificação (possível staleness)
4. Compara lista de arquivos com `mapeamento-arquivos.md`

---

#### M07 — Integrar `graphql-response.schema.json` nos testes da API

**Problema:** Schema da resposta GraphQL está na vault/scripts mas não é usado pelos testes xUnit.

**Ação:** Copiar ou referenciar o schema nos testes de integração da API. Ou publicar como pacote npm/NuGet interno.

---

#### M08 — Deprecar ou arquivar `referencias-confluence.md`

**Problema:** Cria confusão sobre qual é a fonte de verdade para stakeholders externos.

**Ação:** Adicionar header no arquivo:

```markdown
> ⚠️ Este arquivo é referência histórica. A fonte de verdade migrou para este vault.
> Links Confluence podem estar desatualizados. Última verificação: 2026-04-15.
```

---

#### M09 — Adicionar `implementation-ref` nos ADRs após implementação

**Ação:** Após implementar o endpoint do ADR-002, adicionar ao frontmatter:

```yaml
implementation-ref: "src/gestaoproduto.plataforma.bff/Controllers/TrackingController.cs"
implementation-status: implementado
```

Cria rastreabilidade bidirecional sem depender apenas do commit.

---

## 5. Resumo Executivo

| Dimensão | Status Atual | Depois das Melhorias |
|---|---|---|
| Vault → API | ✅ Funcional via SKILL.md | ✅ Mantido — sem mudança crítica |
| Vault → Frontend | ❌ Nenhuma conexão | ✅ Após M01 |
| Vault → Jira | ⚠️ Convencional (commits) | ✅ Estrutural (frontmatter) após M03 |
| Status E01-E09 | ⚠️ 3 fontes paralelas | ✅ 1 fonte após M02 |
| Rastreabilidade decisão↔código | ❌ Nenhuma | ⚠️ Parcial após M09 |
| Integridade da vault | ⚠️ Manual | ✅ Automatizada após M06 |
| Scripts de teste | ⚠️ Orphans na vault | ⚠️ Integração pendente (M07) |

---

## 6. Ordem de Execução Recomendada

```
Semana atual:    M01 (frontend copilot) + M03 (frontmatter jira-task)
Próximo sprint:  M02 (unificar status) + M04 (mover planning) + M05 (consolidar pendências)
Backlog:         M06 (script integridade) + M07 (schema integration) + M08 + M09
```

---

## Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | O frontend tem um repo próprio com código ou é só placeholder? | Guilherme | 🟡 A confirmar |
| 2 | O `mock/data.json` é consumido diretamente pelo frontend ou só para referência? | Dev frontend | 🟡 A confirmar |
| 3 | `referencias-confluence.md` ainda é consultado por stakeholders externos? | Pedro Martins | 🟡 A confirmar |
| 4 | Haverá CI no vault para integridade ou só local? | Guilherme | 🔴 Não mapeado |
