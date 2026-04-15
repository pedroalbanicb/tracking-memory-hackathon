---
tags: [tracking, discovery, status, hackathon, consolidado]
tipo: tracker
status: ativo
updated: 2026-04-15
autor: Pedro Martins
---

# Discovery Status — Tracking GO (Hackathon)

> Visão consolidada do progresso do discovery por etapa, gaps bloqueantes e próximas ações.
> **Atualizado em 2026-04-15**: E05 e E08 implementados via API Oferta (ADR-004). ADRs 002–006 finalizadas.

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Etapas totais | 9 |
| ✅ Implementadas (endpoint funcional) | 7 (E01, E02, E03, E05, E06, E07, E08) |
| ⚠️ Stubs (endpoint existe, retorna 501/dados parciais) | 2 (E04, E09) |
| 🔴 Totalmente sem mapeamento | 0 |
| RFCs abertas | 0 |
| ADRs registradas | 5 (ADR-002 a ADR-006) |
| Decisões arquiteturais em aberto | 0 — decidido API Oferta para E05/E08 (ADR-004) |

---

## Status por Etapa

### ✅ Implementadas

| # | Etapa | Status | Fonte de Dados | Implementação | Notas |
|---|-------|--------|----------------|--------------|-------|
| 1 | [[E01-cadastro-inicial]] | ✅ Implementado | API Catálogo | `TrackingCadastroService` + `TrackingCatalogoRepositorio` | Via listagem (`POST /tracking/skus/listar`) e analise-ia |
| 2 | [[E02-validacao-fiscal]] | ✅ Implementado | API Catálogo | `TrackingValidacaoFiscalService` | `FlagCompraBloqueada` do endpoint E01 |
| 3 | [[E03-proposta-comercial]] | ✅ Implementado | API Catálogo | `TrackingPropostaComercialService` | `FlagContratoLiberado` — retorna null quando sem contrato |
| 5 | [[E05-estoque]] | ✅ Implementado | API Oferta | `TrackingOfertaRepositorio` | `DisponibilidadeEstoque` em `PrecoSkus[0].PrecoVenda` |
| 6 | [[E06-produzido]] | ✅ Implementado | API Catálogo | `TrackingProduzidoSiteService` | `FlagSkuProduzido` |
| 7 | [[E07-produzido-loja]] | ✅ Implementado | API Catálogo | `TrackingProduzidoLojaService` | `FlagSkuProduzidoLojaFisica` |
| 8 | [[E08-ativacao-pricing]] | ✅ Implementado | API Oferta | `TrackingOfertaRepositorio` | `Valido` na raiz da response da API Oferta |

### ⚠️ Stubs (pendente de integração)

| # | Etapa | Status | Blocker | ADR/Decisão |
|---|-------|--------|---------|-------------|
| 4 | [[E04-agendamento]] | ⚠️ Stub (501) | Falta documentação do fluxo LN/Neogrid (Alonso Dias Assuncao) | Nenhuma — aguardando discovery |
| 9 | [[E09-exibicao-site-loja]] | ⚠️ Stub | Decisão API vs SQL Corp vs MONGOS pendente (Douglas Wolff, Ricardo Tadeu) | [[decisao-fonte-dados-tracking]] |

### 🟡 Sistema identificado — sem interface

> Nenhuma etapa nesta categoria. E06 e E07 foram promovidas para ✅ após confirmação via API Catálogo (ADR-003).
> E05 e E08 foram promovidas para ✅ via API Oferta (ADR-004, 2026-04-15).
| 8 | [[E08-ativacao-pricing]] | ⚠️ Flags confirmadas | SQL: `SkuLojista` / `SkuLojistaPreço` | `FlagAtiva` em ambas tabelas; pricing exclusivo do site | Interface de leitura (SQL Corp direto ou via API); decisão [[decisao-fonte-dados-tracking]] | 5 abertos (1 🔴) |
| 9 | [[E09-exibicao-site-loja]] | ⚠️ Regras mapeadas | SQL Corp → MONGOS (MongoDB de Pricing) | 14+ flags em 5 grupos (SkuLojista, Sku, Produto, Marca, Categoria), fluxo Rundeck | Endpoint API/MONGOS; coleção MongoDB; decisão SQL Corp vs MONGOS | 8 abertos (3 🔴) |

### 🟡 Sistema identificado — sem interface

> Nenhuma etapa nesta categoria. E06 e E07 foram promovidas para ✅ Integrado após confirmação de campos na API Catálogo (ADR-003, 2026-04-15).

---

## Decisões Arquiteturais Pendentes

## Decisões Arquiteturais

| Decisão | Impacta | Status | Doc | Responsáveis |
|---------|---------|--------|-----|-------------|
| ~~API (MongoDB) vs SQL direto para flags E08~~ | E08 | ✅ **Resolvido** — API Oferta (ADR-004) | [[ADR-004-integracao-api-oferta-e05-e08]] | Guilherme Maesta |
| API (MongoDB) vs SQL direto para flags de exibição E09 | E09 | 🔴 Em aberto | [[decisao-fonte-dados-tracking]] | Douglas Wolff, Ricardo Tadeu, William |
| SQL ↔ MongoDB divergência (V2) | E09 | Posicionado como V2 | [[validacao-sincronizacao-sql-mongo]] | Time Plataforma |

---

## Gaps Bloqueantes (🔴 Críticos)

> Gaps que impedem a implementação. E05 e E08 foram desbloqueados via ADR-004.

| # | Etapa | Gap | Quem pode responder | Ação |
|---|-------|-----|---------------------|------|
| 1 | E04 | Método de integração com LN/Neogrid; fluxo Databricks/SQL | Alonso Dias Assuncao | Documentar info já recebida |
| 2 | E09 | Qual API/endpoint acessa as flags SQL para integração? | **Time Oferta** | Depende da decisão API vs SQL |
| 3 | E09 | Qual collection/endpoint do MongoDB (MONGOS)? | **Time Plataforma** | Agendar conversa |
| 4 | E09 | Tracking via API ou SQL direto? (decisão arquitetural) | **Douglas Wolff / Ricardo Tadeu / William** | Decisão pendente |

---

## Pessoas-Chave para Fechar o Discovery

| Pessoa | Área | Pode responder sobre | Prioridade |
|--------|------|---------------------|-----------|
| **Priscila Pipolo Santiago** | Supply | Fluxo ponta a ponta de agendamento, crossdocking | 🔴 Alta — E04 |
| **Jessica Fernando de Camargo** | Supply | Complemento do fluxo de agendamento | 🟡 Média — E04 |
| **Douglas Souza Wolff** | SRE IC + Pricing | Decisão API vs SQL, flags, estrutura tabelas | 🔴 Alta — E09 |
| **Ricardo Tadeu Lima** | Plataforma | MONGOS, replicação, checkout, OMS | 🔴 Alta — E09 |
| **Carmen Stoiko** | Dados / Datalake | Ingestão agenda no Databricks | 🟡 Média — E04 |
| **Alonso Dias Assuncao** | SRE IC + Pricing | Databricks agendamento, views de custo estoque | 🟡 Documentar info recebida — E04 |
| **Juliana Dos Santos** | GO | Sistemas por etapa (já contribuiu para E01-E09) | ✅ Contribuição concluída |
| **Time Catálogo** | Catálogo | `composicao` paths, eventos Kafka, campo `ContratoLiberado` | 🟡 Média — E03 |

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
