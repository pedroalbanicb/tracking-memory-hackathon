---
tags: [meta, mapeamento, vault, indice, inconsistencias, tracking]
tipo: meta-doc
status: ativo
updated: 2026-04-10
autor: Pedro Martins
---

# Mapeamento de Arquivos do Vault — Tracking GO

> Inventário individual de cada arquivo do vault. Gerado em 09/04/2026, atualizado em 10/04/2026.
> Fonte de verdade do pipeline: `mock/data.json` — 9 etapas (E01–E09).

---

## Resumo de Integridade do Vault

> ✅ **Arquivos de etapas renomeados corretamente** (E08-ativacao-pricing.md, E09-exibicao-site-loja.md) — verificado em 2026-04-09.
> ✅ **README, PRD-001 e sku-lifecycle** atualizados com pipeline de 9 etapas e wikilinks corretos.
> ✅ **RFC-002** movida para `RFC/RFC-002-agendamento.md` e populada com template + contexto.
> ✅ **mock/data.json** regenerado como JSON válido a partir de `data.js`.
> ✅ **sku-on-off-1p-3p.md** — labels de exibição corrigidos (E07→E08, E08→E09).
> ✅ **sku-lifecycle.md** — typo `lifecyle` corrigido no frontmatter.

---

## Mapeamento Individual por Arquivo

---

### `/README.md`

| Atributo | Valor |
|---|---|
| Tipo | Home / Índice Principal do Vault |
| Status | ✅ Íntegro |

---

### `/RFC/RFC-002-agendamento.md`

| Atributo | Valor |
|---|---|
| Tipo | RFC (rascunho) |
| Status | ✅ Populado — draft com template e contexto |
| Frontmatter | `tags: [rfc, tracking, agendamento, ln, neogrid]` · `status: draft` · `autor: Pedro Martins` |

**Conteúdo:** RFC preenchida com motivação, hipóteses de interface (LN, Neogrid ou ambos), plano de rollout e perguntas em aberto. Aguardando discovery com time de Operações/GO.

---

### `/overview.html`

| Atributo | Valor |
|---|---|
| Tipo | Arquivo HTML (visual/mockup) |
| Status | ✅ Revisado 10/04 — E7→E8 corrigido, footer atualizado |

**Conteúdo:** Visualização estática do painel de tracking. Auditado e corrigido em 10/04/2026.

---

### `/ADR/README.md`

| Atributo | Valor |
|---|---|
| Tipo | Índice da pasta ADR |
| Status | ✅ Íntegro |
| Conteúdo | Descreve o propósito das ADRs, quando criar, status possíveis e padrão de nomenclatura |

**Nenhuma inconsistência.** Índice declara corretamente que não há ADRs ainda.

---

### `/ADR/template.md`

| Atributo | Valor |
|---|---|
| Tipo | Template |
| Status | ✅ Íntegro |
| Frontmatter | `tags: [adr, tracking]` · `status: accepted` · placeholders presentes |

**Conteúdo:** Template padrão de ADR com seções: Contexto, Decisão, Consequências, Alternativas Rejeitadas, Referências.

**Nenhuma inconsistência.**

---

### `/PRD/README.md`

| Atributo | Valor |
|---|---|
| Tipo | Índice da pasta PRD |
| Status | ✅ Íntegro |
| Conteúdo | Lista PRD-001 como Draft (2026-04-09) |

**Nenhuma inconsistência.**

---

### `/PRD/template.md`

| Atributo | Valor |
|---|---|
| Tipo | Template |
| Status | ✅ Íntegro |
| Frontmatter | `tags: [prd, tracking]` · placeholders presentes |

**Conteúdo:** Template padrão de PRD com seções: Problema, Objetivo, Usuários, Solução Proposta, Critérios de Aceite, Fora do Escopo, Perguntas em Aberto.

**Nenhuma inconsistência.**

---

### `/PRD/PRD-001-tracking-sku-lifecycle.md`

| Atributo | Valor |
|---|---|
| Tipo | PRD ativo |
| Status | ✅ Íntegro — pipeline com 9 etapas e wikilinks corretos |

---

### `/RFC/README.md`

| Atributo | Valor |
|---|---|
| Tipo | Índice da pasta RFC |
| Status | ✅ Íntegro — RFC-002 listada |

---

### `/RFC/template.md`

| Atributo | Valor |
|---|---|
| Tipo | Template |
| Status | ✅ Íntegro |

**Conteúdo:** Template padrão de RFC com seções: Resumo, Motivação, Proposta Detalhada, Alternativas, Impacto e Riscos, Plano de Rollout.

**Nenhuma inconsistência.**

---

### `/RFC/RFC-003-estoque.md`

| Atributo | Valor |
|---|---|
| Tipo | RFC (draft) |
| Status | ✅ Stub criado — aguardando decisão de integração |
| Tags | `[rfc, tracking, estoque, inventario, integracao]` |
| Frontmatter | `status: draft` · `autor: Pedro Martins` · `updated: 2026-04-10` |

**Conteúdo:** Proposta de estratégia de integração para dados de estoque (E05). Opções: API, SQL direto ou evento Kafka. Vinculada à [[decisao-fonte-dados-tracking]].

---

### `/RFC/RFC-004-pricing-exibicao.md`

| Atributo | Valor |
|---|---|
| Tipo | RFC (draft) |
| Status | ✅ Stub criado — aguardando decisão de integração |
| Tags | `[rfc, tracking, pricing, exibicao, integracao, skulojista, mongos]` |
| Frontmatter | `status: draft` · `autor: Pedro Martins` · `updated: 2026-04-10` |

**Conteúdo:** Proposta de estratégia de integração para pricing (E08) e exibição (E09). Opções: SQL Corp direto ou MongoDB/MONGOS. Vinculada à [[decisao-fonte-dados-tracking]].

---

### `/docs/referencias-confluence.md`

| Atributo | Valor |
|---|---|
| Tipo | Índice de referências externas |
| Status | ⚠️ Menor — labels inconsistentes com numeração de etapas |
| Tags | `[confluence, referencias, indice, tracking, go]` |
| Frontmatter | `updated: 2026-04-09` · nota de correção MANOS→MONGOS registrada |

**Conteúdo:** Mapeia páginas Confluence por tema, organizadas por etapa do pipeline. 9 seções.

**Nenhuma inconsistência.** Wikilinks e labels verificados em 10/04/2026.

---

### `/docs/conceitos/decisao-fonte-dados-tracking.md`

| Atributo | Valor |
|---|---|
| Tipo | Decisão arquitetural pendente |
| Status | ✅ Íntegro — conteúdo correto |
| Tags | `[conceito, decisao, arquitetura, tracking, api, sql, mongodb, MONGOS]` |
| Frontmatter | `tipo: decisao-pendente` · `status: em-aberto` · `updated: 2026-04-09` |
| Fontes | Douglas Souza Wolff, Ricardo Tadeu Lima, Douglas Willian De Castro |

**Conteúdo:** Debate sobre usar API (o que cliente vê) vs SQL direto (fonte de verdade do checkout) como fonte de dados do tracking. Status: sem decisão.

**Wikilinks afetados após renomeação:**
- `[[E09-exibicao-site-loja]]` → `[[E09-exibicao-site-loja]]`

---

### `/docs/conceitos/regras-estoque-inventario.md`

| Atributo | Valor |
|---|---|
| Tipo | Conceito de domínio |
| Status | ✅ Íntegro |
| Tags | `[conceito, estoque, inventario, sql, saldo, filial, companhia, modalidade, oms, regional]` |
| Frontmatter | `tipo: conceito` · `status: confirmado` · `updated: 2026-04-09` |
| Fontes | Query SQL; Ricardo Tadeu Lima — reunião 09/04/2026 |

**Conteúdo:** Estrutura de tabelas do schema `Inventario`, relacionamentos, campos relevantes, regra principal (`QuantidadeDisponivel > 0`), filtros da query de referência e regras de negócio.

**Nenhuma inconsistência de conteúdo.** Wikilink `[[E04-agendamento]]` presente — não afetado por renomeação.

---

### `/docs/conceitos/regras-exibicao-sku.md`

| Atributo | Valor |
|---|---|
| Tipo | Conceito de domínio |
| Status | ✅ Íntegro — conteúdo expandido e correto |
| Tags | `[conceito, exibicao, sku, flags, mongodb, MONGOS, sql-corp, marca, categoria, sql]` |
| Frontmatter | `tipo: conceito` · `status: expandido` · `updated: 2026-04-09` |
| Fontes | Ricardo Tadeu Lima, Douglas Souza Wolff |
| Nota | "FLAVIA" era erro de transcrição (corrigido 10/04) — significado real: "flag atualiza"; "Handeck" corrigido para "Rundeck" |

**Conteúdo:** Mapeamento completo das flags de exibição (11 flags em 5 grupos: SkuLojista, Sku, Produto, Marca, Categoria), fluxo de propagação via Rundeck, replicação para MongoDB (MONGOS), validação de divergência SQL↔MongoDB.

**Wikilinks afetados após renomeação:** Nenhum — não referencia E07-ativacao-pricing nem E08-exibicao-site-loja diretamente pelos nomes de arquivo.

---

### `/docs/conceitos/sku-on-off-1p-3p.md`

| Atributo | Valor |
|---|---|
| Tipo | Conceito de domínio |
| Status | ✅ Íntegro |
| Tags | `[conceito, sku, 1p, 3p, backoffice, site, tracking]` |
| Frontmatter | `tipo: conceito` · `updated: 2026-04-09` |

**Conteúdo:** Explica diferença entre SKU ON (site/cliente) vs SKU OFF (backoffice), e 1P (Casas Bahia) vs 3P (marketplace). Define escopo do tracking como exclusivamente 1P.

**Wikilinks afetados após renomeação:**
- `[[E08-ativacao-pricing]]` → `[[E08-ativacao-pricing]]`
- `[[E09-exibicao-site-loja]]` → `[[E09-exibicao-site-loja]]`

---

### `/docs/conceitos/validacao-sincronizacao-sql-mongo.md`

| Atributo | Valor |
|---|---|
| Tipo | Conceito de domínio (V2) |
| Status | ✅ Íntegro |
| Tags | `[conceito, sincronizacao, sql, mongodb, MONGOS, divergencia, v2, integracao]` |
| Frontmatter | `tipo: conceito` · `status: proposto` · `escopo: V2 — fora do MVP` · `updated: 2026-04-09` |
| Fontes | Douglas Souza Wolff, Ricardo Tadeu Lima, Guilherme Maesta |

**Conteúdo:** Define regras para detectar divergência entre SQL (fonte) e MongoDB/MONGOS (réplica). Posicionado como V2. Inclui tabela de diagnóstico (Sincronizado OK / Divergência positiva / Divergência negativa).

**Nenhuma inconsistência.**

---

### `/docs/pipeline/sku-lifecycle.md`

| Atributo | Valor |
|---|---|
| Tipo | Índice do pipeline |
| Status | ⚠️ Menor — tabela correta, wikilinks com nome de arquivo incorreto |
| Tags | `[tracking, pipeline, sku, lifecyle, go]` |
| Frontmatter | `tipo: indice-pipeline` · `updated: 2026-04-09` |

**Conteúdo:** Índice do pipeline de 9 etapas com filtros de elegibilidade, tabela de etapas e detalhamento resumido de cada etapa.

**A tabela de etapas está correta** — lista 9 etapas com referências corretas ao conteúdo. Porém os wikilinks usam os nomes de arquivo incorretos para E08 e E09:

| Posição | Wikilink atual | Wikilink correto |
|---|---|---|
| 8 | `[[E08-ativacao-pricing\|Ativação Pricing]]` | `[[E08-ativacao-pricing\|Ativação Pricing]]` |
| 9 | `[[E09-exibicao-site-loja\|Exibição Site/Loja]]` | `[[E09-exibicao-site-loja\|Exibição Site/Loja]]` |

---

### `/docs/pipeline/etapas/E01-cadastro-inicial.md`

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | 1 de 9 |
| Status | ✅ Integrado — endpoint e campos confirmados |
| Tags | `[tracking, pipeline, etapa, cadastro, catalogo]` |
| Frontmatter | `etapa: 1` · `status: integrado` · `origem: API Catálogo` · `updated: 2026-04-09` |

**Conteúdo:** Primeira etapa. Endpoint confirmado: `GET /api/v1/produto-sku/selecionar`. Campos mapeados: `Geral.Nome`, `DataCadastro`, `NomeTipoSku`, `FlagCompraBloqueada`, `FlagVendaBloqueada`, `FlagCrossDocking`. Exemplo de request/response documentado.

**Nenhuma inconsistência.** Wikilinks apontam apenas para E02 (próxima) — não afetado por renomeação.

---

### `/docs/pipeline/etapas/E02-validacao-fiscal.md`

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | 2 de 9 |
| Status | ✅ Integrado — campos confirmados |
| Tags | `[tracking, pipeline, etapa, fiscal, taxweb, catalogo]` |
| Frontmatter | `etapa: 2` · `status: integrado` · `origem: Tax Web (via API Catálogo)` · `updated: 2026-04-09` |
| Fonte | Juliana Dos Santos |

**Conteúdo:** Tax Web (sistema de escrita) + API Catálogo (leitura). Campos: `FlagCompraBloqueada` e `FlagVendaBloqueada` (int 0/1). Mesma chamada da E01. Lógica das flags documentada.

**Nenhuma inconsistência.** Wikilinks: E01 (anterior) e E03 (próxima) — não afetados.

---

### `/docs/pipeline/etapas/E03-proposta-comercial.md`

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | 3 de 9 |
| Status | ⚠️ Integrado parcialmente — campo null em SKUs novos |
| Tags | `[tracking, pipeline, etapa, comercial, ln, infor, baan, catalogo]` |
| Frontmatter | `etapa: 3` · `status: integrado-parcialmente` · `origem: API Catálogo / LN (Infor)` · `updated: 2026-04-09` |

**Conteúdo:** Contrato gerado no ERP LN (Infor). Campo `Mercadorias[].DadosBasicos.ContratoLiberado` confirmado via API Catálogo, mas retorna `null`/ausente para SKUs sem contrato. Campos de data e fornecedor ainda não testados. Lead-time comercial documentado.

**Nenhuma inconsistência.** Wikilinks: E02 (anterior) e E04 (próxima) — não afetados.

---

### `/docs/pipeline/etapas/E04-agendamento.md`

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | 4 de 9 |
| Status | ⚠️ Sistemas identificados — integração a mapear |
| Tags | `[tracking, pipeline, etapa, agendamento, ln, neogrid]` |
| Frontmatter | `etapa: 4` · `status: mapeado-parcialmente` · `origem: LN / Neogrid` · `updated: 2026-04-09` |
| Fonte | Juliana Dos Santos |

**Conteúdo:** Sistemas confirmados: LN (Infor) e/ou Neogrid. Campos ainda hipóteses. RFC-002 referenciada. Produtos `Digital/Download` provavelmente pulam esta etapa.

**Problema:** Wikilink `[[RFC-002-agendamento]]` aponta para arquivo vazio na raiz — RFC não preenchida.

---

### `/docs/pipeline/etapas/E05-estoque.md`

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | 5 de 9 |
| Status | ⚠️ Regras mapeadas — integração técnica a definir |
| Tags | `[tracking, pipeline, etapa, estoque, manhattan, wms, inventario, sql]` |
| Frontmatter | `etapa: 5` · `status: regras-mapeadas` · `origem: Banco Inventario (SQL)` · `updated: 2026-04-09` |
| Fonte | Juliana Dos Santos; Query SQL — reunião 09/04/2026 |

**Conteúdo:** Regra principal `QuantidadeDisponivel > 0`. 14 campos SQL confirmados. 4 tipos de estoque: Físico, Fingido, Crossdocking, Em Trânsito (valores de `TipoEstoque.Tipo` ainda a mapear). Linked server `CORP_PRD`.

**Nenhuma inconsistência de conteúdo.** Wikilinks: E04 (anterior) e E06 (próxima) — não afetados.

---

### `/docs/pipeline/etapas/E06-produzido.md`

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | 6 de 9 |
| Status | ⚠️ Sistema identificado — integração a mapear |
| Tags | `[tracking, pipeline, etapa, produzido, produzido-site, admin, conteudo]` |
| Frontmatter | `etapa: 6` · `status: mapeado-parcialmente` · `origem: Admin` · `updated: 2026-04-09` |
| Fonte | Juliana Dos Santos |

**Conteúdo:** Produzido Site — flag `produzido_site (S/N)`. Sistema: Admin (corrigido de Catálogo). Componentes: fotos, descrição, especificações, ficha técnica. Lead-time de produção de conteúdo documentado.

**Referências no final do arquivo:** Inclui `[[E08-ativacao-pricing]]` como referência auxiliar (etapa 8). Ficará quebrado após renomeação, mas é referência informativa, não link de navegação.

**Wikilinks afetados após renomeação:**
- `[[E08-ativacao-pricing]]` → `[[E08-ativacao-pricing]]`

---

### `/docs/pipeline/etapas/E07-produzido-loja.md`

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | 7 de 9 |
| Status | ⚠️ Sistema identificado — integração a mapear |
| Tags | `[tracking, pipeline, etapa, produzido, produzido-loja, admin, conteudo]` |
| Frontmatter | `etapa: 7` · `status: mapeado-parcialmente` · `origem: Admin` · `updated: 2026-04-09` |
| Fonte | Juliana Dos Santos |

**Conteúdo:** Produzido Loja Física — flag `produzido_loja_fisica (S/N)`. Sistema: Admin. Canal independente do site (E06). SKUs Digital/Download geralmente não precisam desta flag.

**Wikilinks afetados após renomeação:**
- `[[E08-ativacao-pricing]]` (próxima etapa) → `[[E08-ativacao-pricing]]`

---

### `/docs/pipeline/etapas/E08-ativacao-pricing.md`

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | **8 de 9** |
| Status | ✅ Flags confirmadas — integração a definir |
| Tags | `[tracking, pipeline, etapa, pricing, go, admin, precificacao, site, sklojista, sql]` |
| Frontmatter | `etapa: 8` · `status: flags-confirmadas` · `origem: SkuLojista / SkuLojistaPreço (SQL)` · `updated: 2026-04-09` |
| Fontes | Juliana Dos Santos, Ricardo Tadeu Lima, Douglas Souza Wolff |

**Conteúdo:** Flags SQL confirmadas por Douglas Souza Wolff: `SkuLojista.FlagAtiva` e `SkuLojistaPreço.FlagAtiva`. Flag exclusiva do canal online (site/app) — loja física usa preço base como fallback. API Oferta requer região. Rundeck propaga para `SKU.ativa` → `Produto.ativa` (~1 min). Análise multi-bandeira (CB/EX/PF).

**Wikilinks afetados após renomeação:**
- `[[E07-produzido-loja]]` (etapa anterior) — íntegro
- `[[E09-exibicao-site-loja]]` (próxima etapa) → `[[E09-exibicao-site-loja]]`

---

### `/docs/pipeline/etapas/E08-exibicao-site-loja.md` ← 🔴 NOME INCORRETO

| Atributo | Valor |
|---|---|
| Tipo | Etapa do pipeline |
| Etapa | **9 de 9** (conforme frontmatter e mock/data.json) |
| Status | ⚠️ Flags expandidas — integração a definir |
| Tags | `[tracking, pipeline, etapa, exibicao, sql-corp, site, loja-fisica, flags, rundeck, mongos, mongodb, marca, categoria]` |
| Frontmatter | `etapa: 9` · `status: flags-expandidas` · `origem: Corp / SkuLojista / SKU / Produto / Marca / Categoria / MONGOS` · `updated: 2026-04-10` |
| Fontes | Juliana Dos Santos, Ricardo Tadeu Lima, Douglas Souza Wolff |

**⛔ INCONSISTÊNCIA CRÍTICA:** O arquivo está nomeado `E08-exibicao-site-loja.md`, mas o frontmatter declara `etapa: 9` e o `mock/data.json` confirma `"etapa": "E09"`. O nome correto é **`E09-exibicao-site-loja.md`**.

**Conteúdo:** Etapa final. 11 flags em 5 grupos (SkuLojista, Sku, Produto, Marca, Categoria com 4 níveis hierárquicos). Fluxo de propagação Rundeck → SKU → Produto (+1min). Replicação para MONGOS (MongoDB). Status consolidado `disponivel_para_compra`. Lead-times documentados. `FlagSkuProduzidoLojaFisica` identificada como legada/comentada.

---

### `/mock/data.json` ← Fonte de Verdade do Pipeline

| Atributo | Valor |
|---|---|
| Tipo | Dados do mockup visual |
| Status | ✅ Íntegro — pipeline de 9 etapas correto |

**Conteúdo:** Define 9 etapas (E01–E09) com chaves, labels, sistemas e detalhes. Inclui dados de produtos de exemplo. **Este é o documento mais consistente do vault.**

Pipeline conforme `data.json`:

| key | etapa | label | sistema |
|---|---|---|---|
| cadastro | E01 | Cadastro | GO |
| fiscal | E02 | Validação Fiscal | TAX-WEB |
| comercial | E03 | Proposta Comercial | LN |
| agendamento | E04 | Agendamento | LN/Neogrid |
| estoque | E05 | Estoque | Manhattan |
| produzidoSite | E06 | Produzido Site | ADMIN |
| produzidoLoja | E07 | Produzido Loja Física | ADMIN |
| pricing | **E08** | Ativação Pricing | GO/ADMIN |
| exibicao | **E09** | Exibição Site | CORP |

---

### `/mock/data.js`

| Atributo | Valor |
|---|---|
| Tipo | Script JS (provavelmente importa/exporta data.json) |
| Status | ℹ️ Não analisado em detalhe |

---

### `/mock/index.html`

| Atributo | Valor |
|---|---|
| Tipo | Mockup HTML do painel de tracking |
| Status | ℹ️ Não analisado em detalhe |

---

## Consolidado das Inconsistências

### 🔴 Críticas (bloqueantes)

| # | Arquivo | Problema | Ação necessária |
|---|---|---|---|
| C1 | `E07-ativacao-pricing.md` | Nome de arquivo diz E07, frontmatter e mock dizem etapa 8 | Renomear para `E08-ativacao-pricing.md` |
| C2 | `E08-exibicao-site-loja.md` | Nome de arquivo diz E08, frontmatter e mock dizem etapa 9 | Renomear para `E09-exibicao-site-loja.md` |

### ⚠️ Médias (desatualizações)

| # | Arquivo | Problema | Ação necessária |
|---|---|---|---|
| M1 | `README.md` | Tabela pipeline com 8 etapas — falta E07-produzido-loja, wikilinks errados | Atualizar tabela para 9 etapas |
| M2 | `PRD/PRD-001-tracking-sku-lifecycle.md` | Tabela pipeline com 8 etapas — falta E07-produzido-loja | Atualizar tabela para 9 etapas |
| M3 | `RFC-002-agendamento.md` | Arquivo vazio na raiz — deveria estar em `RFC/` e ter conteúdo | Mover para `RFC/` e preencher |
| M4 | `RFC/README.md` | Índice diz "Nenhuma RFC ainda" — inconsistente com RFC-002 | Atualizar após mover a RFC |

### ℹ️ Wikilinks que quebrarão após renomeação (C1 e C2)

Todos os arquivos que referenciam `[[E08-ativacao-pricing]]` ou `[[E09-exibicao-site-loja]]` precisarão dos wikilinks atualizados:

| Arquivo | Wikilink a atualizar |
|---|---|
| `README.md` | `[[E08-ativacao-pricing]]` → `[[E08-ativacao-pricing]]` e `[[E09-exibicao-site-loja]]` → `[[E09-exibicao-site-loja]]` |
| `PRD/PRD-001-tracking-sku-lifecycle.md` | `[[E08-ativacao-pricing]]` e `[[E09-exibicao-site-loja]]` |
| `docs/referencias-confluence.md` | `[[E08-ativacao-pricing]]` e `[[E09-exibicao-site-loja]]` |
| `docs/conceitos/decisao-fonte-dados-tracking.md` | `[[E09-exibicao-site-loja]]` |
| `docs/conceitos/sku-on-off-1p-3p.md` | `[[E08-ativacao-pricing]]` e `[[E09-exibicao-site-loja]]` |
| `docs/pipeline/sku-lifecycle.md` | `[[E08-ativacao-pricing]]` e `[[E09-exibicao-site-loja]]` |
| `docs/pipeline/etapas/E06-produzido.md` | `[[E08-ativacao-pricing]]` |
| `docs/pipeline/etapas/E07-produzido-loja.md` | `[[E08-ativacao-pricing]]` (próxima etapa) |
| `docs/pipeline/etapas/E08-ativacao-pricing.md` *(novo nome)* | `[[E09-exibicao-site-loja]]` → `[[E09-exibicao-site-loja]]` |
