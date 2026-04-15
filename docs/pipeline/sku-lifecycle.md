---
tags: [tracking, pipeline, sku, lifecycle, go]
tipo: indice-pipeline
updated: 2026-04-09
---

# Tracking de Produtos — Ciclo de Vida do SKU

> Fonte original: Whiteboard GO - Tracking de Produtos (Confluence CDPO)
> Migrado para repositório em: 2026-04-09

## Objetivo

Mapear em qual **estado** um SKU se encontra em cada ponto de verificação do tracking de produtos — desde o **cadastramento inicial** até a **disponibilidade para compra** no site ou loja física.

> ⚠️ **Modelo de Steps Independentes (atualizado 10/04/2026)**
>
> Cada step é uma **consulta de estado independente** a uma aplicação/sistema. O tracking **lê** o estado atual em cada ponto — não controla nem impõe progressão sequencial. Um SKU pode ter estoque (E05) antes de ter contrato liberado (E03). A numeração (E01–E09) é ordenação lógica para visualização, **não dependência obrigatória**.
>
> Para cada step, o tracking precisa responder:
> 1. **Qual sistema** contém o dado?
> 2. **Como consultar** esse dado? (API, query SQL, evento Kafka)
> 3. **O que mostrar** ao gestor sobre o estado atual naquele ponto?

---

## Filtros de Elegibilidade

> **Escopo: apenas produtos 1P (First Party).** Ver [[sku-on-off-1p-3p]] para entender a distinção 1P/3P.

Para um SKU aparecer no tracking, ele deve atender:

| Filtro | Valor |
|--------|-------|
| Produzido | S ou N (configurável) |
| Com Estoque | Sim |
| Ativo | Sim |
| Categoria | Configurável por painel |

---

## Etapas do Tracking de Produtos

> Cada etapa é um **checkpoint de estado independente**. A numeração é ordenação lógica, não dependência sequencial. Cada step consulta um sistema diferente para verificar o estado do SKU naquele ponto.

| # | Etapa | Origem | Status |
|---|-------|--------|--------|
| 1 | [[E01-cadastro-inicial\|Cadastro Inicial]] | GO / Catálogo | ✅ Integrado — endpoint e campos confirmados |
| 2 | [[E02-validacao-fiscal\|Validação Fiscal]] | **Tax Web** (via API Catálogo) | ✅ Integrado — `FlagCompraBloqueada` e `FlagVendaBloqueada` confirmados |
| 3 | [[E03-proposta-comercial\|Proposta Comercial]] | API Catálogo / LN (Infor) | ⚠️ Interface confirmada — `ContratoLiberado` null em SKUs sem contrato |
| 4 | [[E04-agendamento\|Agendamento]] | **LN / Neogrid** | Sistema identificado — integração a mapear |
| 5 | [[E05-estoque\|Estoque]] | **Banco Inventario (SQL)** | Regras mapeadas — integração a definir |
| 6 | [[E06-produzido\|Produzido Site]] | **Admin** | Sistema identificado — integração a mapear |
| 7 | [[E07-produzido-loja\|Produzido Loja Física]] | **Admin** | Sistema identificado — integração a mapear |
| 8 | [[E08-ativacao-pricing\|Ativação Pricing]] | **GO / Admin** (SQL: `SkuLojista`, `SkuLojistaPreço`) | Flags confirmadas — integração a definir |
| 9 | [[E09-exibicao-site-loja\|Exibição Site/Loja]] | **SkuLojista / SKU / Produto / MONGOS** | Regras mapeadas — flags e propagação documentados |

> ℹ️ Origens das etapas 2, 4, 5, 6, 7 e 8 confirmadas por **Juliana Dos Santos** em 2026-04-09. Regras de negócio de **E05** (estoque) e **E09** (exibição) mapeadas em reunião com **Ricardo Tadeu Lima e Douglas Souza Wolff** em 09/04/2026. Interface de **E01**, **E02** e **E03** confirmadas via curl testado em 2026-04-09 (endpoint `GET /api/v1/produto-sku/selecionar` da API Catálogo).

---

### ETAPA 1 — Cadastro Inicial do Produto

> Detalhamento completo: [[E01-cadastro-inicial]]

**Origem dos dados:** GO / Catálogo

| Campo | Descrição |
|-------|-----------|
| Data de Cadastro | Data em que o produto foi registrado no sistema |
| Tipo Produto | Classifica o produto (Normal, Crossdocking, Digital/Download, etc.) |

**Observações:**
- SKUs novos nascem com **Compra Bloqueada**
- A liberação de compra acontece na validação fiscal (Step 2) — mas o tracking verifica ambos os estados independentemente

---

### ETAPA 2 — Validação Fiscal

> Detalhamento completo: [[E02-validacao-fiscal]]

**Origem dos dados:** Tax Web (escrita) → API Catálogo (leitura)

| Campo | Descrição |
|-------|----------|
| FlagCompraBloqueada | 0 = liberado, 1 = bloqueado (Tax Web) |
| FlagVendaBloqueada | 0 = liberada, 1 = bloqueada |

**Regras de negócio:**
- `FlagCompraBloqueada = 0` → SKU liberado para compra
- `FlagCompraBloqueada = 1` → Compra bloqueada (pendente validação fiscal)
- Sem liberação fiscal não é possível iniciar a etapa de compra

---

### ETAPA 3 — Proposta Comercial

> Detalhamento completo: [[E03-proposta-comercial]]

**Origem dos dados:** LN (Infor — ERP)

| Campo | Descrição |
|-------|-----------|
| Contrato Liberado | Indica se o contrato de compra foi gerado |

**Observações:**
- O Contrato de compra é gerado no LN
- Dados ficam nas tabelas BAAN
- Inclui informação no catálogo na chamada de fornecedor ou de marca
- Lead-time com a data e hora de emissão do primeiro contrato
- Essa informação também existe para cálculo de Lead-time

**Sistema:** Workbench / LN (Infor)
- Caminho: Mapa de Comercialização → Contrato de Compras por Mapa de Comercialização

---

### ETAPA 4 — Agendamento

> Detalhamento completo: [[E04-agendamento]]

**Origem dos dados:** LN / Neogrid (confirmado por Juliana Dos Santos)

| Campo | Descrição |
|-------|----------|
| data_agendamento | Data prevista de entrega pelo fornecedor |
| tipo_agendamento | Entrega, crossdocking, etc. |

> ⚠️ Sistemas confirmados (LN e Neogrid). Método de integração pendente.

---

### ETAPA 5 — Estoque

> Detalhamento completo: [[E05-estoque]]

**Origem dos dados:** Banco Inventario (SQL) — schema `Inventario`

| Campo | Descrição |
|-------|----------|
| QuantidadeDisponivel | Volume disponível (regra: `> 0`) |
| TipoEstoque | Físico, Fingido, Crossdocking, Em Trânsito |
| DataPrevisaoChegada | Previsão de chegada (estoque em trânsito) |

**Tipos de estoque especiais:**
- Estoque Fingido
- Crossdocking
- Pré-Lançamento
- Digital/Download

> ✅ Regras de negócio mapeadas via query SQL (reunião 09/04/2026). Método de integração pendente.

---

### ETAPA 6 — Produzido Site

> Detalhamento completo: [[E06-produzido]]

**Origem dos dados:** Admin

| Campo | Descrição |
|-------|-----------|
| Flag Produzido - Site | Indica se o conteúdo do produto está produzido para o site |

---

### ETAPA 7 — Produzido Loja Física

> Detalhamento completo: [[E07-produzido-loja]]

**Origem dos dados:** Admin

| Campo | Descrição |
|-------|-----------|
| Flag Produzido - Loja Física | Indica se o conteúdo está produzido para loja física |

> ⚠️ Um SKU pode estar produzido para site mas não para loja, e vice-versa — estados independentes.

---

### ETAPA 8 — Ativação Pricing (Site)

> Detalhamento completo: [[E08-ativacao-pricing]]

**Origem dos dados:** GO / Admin (SQL: `SkuLojista.FlagAtiva`, `SkuLojistaPreço.FlagAtiva`)

| Campo | Descrição |
|-------|----------|
| SkuLojista.FlagAtiva | Ativação do lojista para venda no canal |
| SkuLojistaPreço.FlagAtiva | Ativação do preço por canal (site/app) |

> ✅ Flags SQL confirmadas por Douglas Souza Wolff (09/04/2026). Pricing é exclusivo do site — loja física usa fallback. Ver [[decisao-fonte-dados-tracking]] para decisão de interface.

---

### ETAPA 9 — Exibição — Site / Loja Física

> Detalhamento completo: [[E09-exibicao-site-loja]]

**Origem dos dados:** SQL (`SkuLojista`, `Sku`, `Produto`, `Marca`, `Categoria`) → MONGOS (MongoDB)

| Campo | Descrição |
|-------|----------|
| Flags de ativação (5 grupos) | SkuLojista + Sku + Produto + Marca + Categoria — todas `FlagAtiva = 1` |
| Propagação | Rundeck job + pulso de estoque → MONGOS |
| URL Site\SKU | URL de acesso ao produto no site |

> ✅ Flags e fluxo de propagação mapeados por Ricardo Tadeu Lima e Douglas Souza Wolff (09/04/2026). Interface de leitura pendente — ver [[decisao-fonte-dados-tracking]].

---

## Diagrama de Status

```
SKU Cadastrado
     │
     ▼
[E1] Cadastro Inicial ──── Atributos e tipo produto (GO/Catálogo)
     │
     ▼
[E2] Validação Fiscal ──── Ok Fiscal = N → Liberado para Compra (GO/Catálogo)
     │
     ▼
[E3] Proposta Comercial ── Contrato gerado no LN → BAAN
     │
     ▼
[E4] Agendamento ────────── (origem a mapear) — pode ser N/A
     │
     ▼
[E5] Estoque ────────────── Físico / Fingido / Crossdocking (origem a mapear)
     │
     ▼
[E6] Produzido Site ───── Flag Site (Admin)
     │
     ▼
[E7] Produzido Loja Física ─ Flag Loja Física (Admin)
     │
     ▼
[E8] Ativação Pricing ─── Precificado Site (Oferta?)
     │
     ▼
[E9] Exibição ───────── URL publicada, disponível para compra (Oferta?)
     │
     ▼
  ✅ SKU ATIVO — Disponível para compra
```

---

## Gaps Identificados

| Gap | Etapa | Ação Sugerida |
|-----|-------|---------------|
| Origem de dados do Agendamento não mapeada | 4 | Discovery pendente — LN/Neogrid |
| Origem de dados do Estoque não mapeada | 5 | Abrir RFC-003 |
| Confirmar se Oferta é realmente a fonte de Pricing/Exibição | 7, 8 | Abrir RFC-004 |

---

## Referências

- [[discovery-status]] — Status consolidado do discovery por etapa
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[regras-exibicao-sku]] — Regras de exibição no site

---

*Última atualização: 2026-04-10*
*Migrado por: Pedro Martins*
