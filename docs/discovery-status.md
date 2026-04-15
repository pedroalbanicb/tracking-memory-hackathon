---
tags: [tracking, discovery, status, hackathon, consolidado]
tipo: tracker
status: ativo
updated: 2026-04-10
autor: Pedro Martins
---

# Discovery Status — Tracking GO (Hackathon)

> Visão consolidada do progresso do discovery por etapa, gaps bloqueantes e próximas ações.
> **Deadline: 10/04/2026** — o que falta para fechar o mapeamento do pipeline.
> Varredura completa do vault concluída. Redundância removida.

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Etapas totais | 9 |
| ✅ Integradas (endpoint + campos testados) | 5 (E01, E02, E03, E06, E07) |
| ⚠️ Parcialmente mapeadas (fonte confirmada, integração pendente) | 2 (E04, E05) |
| 🟡 Flags confirmadas — interface a definir | 2 (E08, E09) |
| 🔴 Totalmente sem mapeamento | 0 |
| RFCs abertas | 0 |
| ADRs registradas | 2 (ADR-002, ADR-003) |
| Decisões arquiteturais em aberto | 1 (API vs SQL — [[decisao-fonte-dados-tracking]]) |

---

## Status por Etapa

### ✅ Prontas para implementação

| # | Etapa | Status | Fonte de Dados | Interface Testada | Gaps Abertos |
|---|-------|--------|----------------|-------------------|-------------|
| 1 | [[E01-cadastro-inicial]] | ✅ Integrado | API Catálogo | `GET /api/v1/produto-sku/selecionar` — testado via curl | 3 (nenhum bloqueante) |
| 2 | [[E02-validacao-fiscal]] | ✅ Integrado | Tax Web → API Catálogo | Mesmo endpoint E01 — `FlagCompraBloqueada` confirmado | 3 (nenhum bloqueante) |
| 3 | [[E03-proposta-comercial]] | ✅ Integrado | API Catálogo / LN (Infor) | Mesmo endpoint — `FlagContratoLiberado` confirmado | 4 (nenhum bloqueante) |
| 6 | [[E06-produzido]] | ✅ Integrado | Admin (escrita) / API Catálogo (leitura) | Mesmo endpoint — `FlagSkuProduzido` confirmado | 3 (nenhum bloqueante) |
| 7 | [[E07-produzido-loja]] | ✅ Integrado | Admin (escrita) / API Catálogo (leitura) | Mesmo endpoint — `FlagSkuProduzidoLojaFisica` confirmado | 4 (nenhum bloqueante) |

### ⚠️ Fonte confirmada — integração a definir

| # | Etapa | Status | Fonte de Dados | O que temos | O que falta | Gaps Bloqueantes |
|---|-------|--------|----------------|-------------|-------------|-----------------|
| 3 | [[E03-proposta-comercial]] | ⚠️ Parcial | API Catálogo / LN | Campo `ContratoLiberado` na API (null quando sem contrato) | `data_emissao_contrato` path na composição; múltiplos contratos? | 4 abertos |
| 4 | [[E04-agendamento]] | ⚠️ Parcial | LN → Neogrid | Sistemas confirmados (Juliana). **Falta documentar info do Alonso Dias Assuncao** (fluxo, Databricks, query SQL) | Método de integração pendente | 5 abertos |
| 5 | [[E05-estoque]] | ⚠️ Regras mapeadas | Banco Inventario (SQL) | Query SQL completa, schema `Inventario`, 14 campos confirmados | Método integração (API vs banco direto); valores `TipoEstoque` | 7 abertos (1 🔴) |
| 8 | [[E08-ativacao-pricing]] | ⚠️ Flags confirmadas | SQL: `SkuLojista` / `SkuLojistaPreço` | `FlagAtiva` em ambas tabelas; pricing exclusivo do site | Interface de leitura (SQL Corp direto ou via API); decisão [[decisao-fonte-dados-tracking]] | 5 abertos (1 🔴) |
| 9 | [[E09-exibicao-site-loja]] | ⚠️ Regras mapeadas | SQL Corp → MONGOS (MongoDB de Pricing) | 14+ flags em 5 grupos (SkuLojista, Sku, Produto, Marca, Categoria), fluxo Rundeck | Endpoint API/MONGOS; coleção MongoDB; decisão SQL Corp vs MONGOS | 8 abertos (3 🔴) |

### 🟡 Sistema identificado — sem interface

> Nenhuma etapa nesta categoria. E06 e E07 foram promovidas para ✅ Integrado após confirmação de campos na API Catálogo (ADR-003, 2026-04-15).

---

## Decisões Arquiteturais Pendentes

| Decisão | Impacta | Status | Doc | Responsáveis |
|---------|---------|--------|-----|-------------|
| API (MongoDB) vs SQL direto para flags de exibição | E08, E09 | 🔴 Em aberto | [[decisao-fonte-dados-tracking]] | Douglas Wolff, Ricardo Tadeu, William |
| SQL ↔ MongoDB divergência (V2) | E09 | Posicionado como V2 | [[validacao-sincronizacao-sql-mongo]] | Time Plataforma |

---

## Gaps Bloqueantes (🔴 Críticos)

> Estes gaps impedem o avanço da implementação e precisam ser resolvidos com urgência.

| # | Etapa | Gap | Quem pode responder | Ação |
|---|-------|-----|---------------------|------|
| 1 | E05 | Método de integração: API ou banco direto `Inventario`? | **Time Plataforma** | Agendar conversa |
| 2 | E08 | Interface de leitura das flags `SkuLojista`/`SkuLojistaPreço` | **Time Oferta / Plataforma** | Depende da decisão API vs SQL |
| 3 | E09 | Qual API/endpoint acessa as flags SQL para integração? | **Time Oferta** | Depende da decisão API vs SQL |
| 4 | E09 | Qual collection/endpoint do MongoDB (MONGOS)? | **Time Plataforma** | Agendar conversa |
| 5 | E09 | Tracking via API ou SQL direto? (decisão arquitetural) | **Douglas Wolff / Ricardo Tadeu / William** | Decisão pendente |

---

## Pessoas-Chave para Fechar o Discovery

| Pessoa | Área | Pode responder sobre | Prioridade |
|--------|------|---------------------|-----------|
| **Priscila Pipolo Santiago** | Supply | Fluxo ponta a ponta de agendamento, crossdocking | 🔴 Alta — E04 |
| **Jessica Fernando de Camargo** | Supply | Complemento do fluxo de agendamento | 🟡 Média — E04 |
| **Douglas Souza Wolff** | SRE IC + Pricing | Decisão API vs SQL, flags, estrutura tabelas | 🔴 Alta — E08/E09 |
| **Ricardo Tadeu Lima** | Plataforma | MONGOS, replicação, checkout, OMS | 🔴 Alta — E09 |
| **Carmen Stoiko** | Dados / Datalake | Ingestão agenda no Databricks | 🟡 Média — E04 |
| **Alonso Dias Assuncao** | SRE IC + Pricing | Databricks agendamento, views de custo estoque | ✅ Info recebida — documentar |
| **Juliana Dos Santos** | GO | Sistemas por etapa (já contribuiu para E01-E09) | 🟡 Confirmar E06/E07 detalhes |
| **Time Catálogo** | Catálogo | `composicao` paths, eventos Kafka, campo `ContratoLiberado` | 🟡 Média — E03 |
| **Time Admin / Conteúdo** | Admin | Flags `produzido_site`/`produzido_loja_fisica`, API | 🔴 Alta — E06/E07 |

---

## Próximas Ações

### Pendentes

- [ ] **Documentar info do Alonso na E04** (fluxo LN→Neogrid, query Databricks, pessoas de referência)
### Prioridades

| Prioridade | Ação | Quem contatar | Resultado esperado |
|-----------|------|---------------|-------------------|
| 🔴 P0 | Fechar decisão API vs SQL | Douglas Wolff + Ricardo Tadeu | ADR → desbloqueia E08/E09 |
| 🔴 P0 | Discovery E06/E07 (Admin) | Time Admin / Conteúdo / Juliana | API ou tabela das flags `produzido` |
| 🔴 P1 | Discovery E04 ponta a ponta | Priscila Pipolo Santiago | Fluxo completo agendamento + crossdocking |
| 🟡 P2 | Confirmar `TipoEstoque` valores | Time GO / Abastecimento | Mapeamento físico vs fingido vs crossdocking |
| 🟡 P2 | Confirmar `composicao` para `data_emissao_contrato` | Time Catálogo | Completar E03 |

---

## O que Já Temos de Bom

- **E01 e E02** estão completas com endpoint testado via curl
- **E05** tem query SQL real com todos os campos e relacionamentos documentados
- **E08 e E09** têm flags SQL completas com propagação (Rundeck) documentada
- **Conceitos** bem documentados: [[regras-estoque-inventario]], [[regras-exibicao-sku]], [[sku-on-off-1p-3p]]
- **Mock data** funcional com cenários variados
- **PRD e RFC** estruturados e rastreáveis

---

## Fontes Consultadas

| Pessoa | Data | Contribuição |
|--------|------|-------------|
| Juliana Dos Santos | 2026-04-09 | Sistemas por etapa (E01-E09) |
| Ricardo Tadeu Lima | 2026-04-09 | Flags exibição, MONGOS, checkout, OMS |
| Douglas Souza Wolff | 2026-04-09 | Flags SQL expandidas (Marca, Categoria), decisão API vs SQL |
| Douglas Willian De Castro | 2026-04-09 | Trade-offs falso positivo |
| Guilherme Maesta | 2026-04-09 | Sub-validação SQL ↔ MONGOS |
| Alonso Dias Assuncao | 2026-04-09 | Fluxo agendamento, Databricks, query SQL, views de custo |

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[decisao-fonte-dados-tracking]] — Decisão API vs SQL (em aberto)
