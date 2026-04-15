---
tags: [prd, tracking, sku, go, lifecycle]
status: draft
autor: Pedro Martins
data: 2026-04-09
revisores: []
updated: 2026-04-09
---

# PRD-001 — Tracking de Produtos GO

**Status:** Draft  
**Autor:** Pedro Martins  
**Data:** 2026-04-09  
**Revisores:** —

---

## Problema

Hoje o time de Gestão de Operações (GO) não tem visibilidade centralizada do ciclo de vida de um SKU. As informações estão espalhadas em múltiplos sistemas (GO/Catálogo, LN, Oferta) e o único way de rastrear o status de um produto é consultar cada sistema manualmente.

Isso gera:
- Lead time alto para identificar onde um produto está travado
- Falta de clareza sobre qual sistema é a **fonte de verdade** de cada etapa
- Retrabalho e dependência de pessoas específicas para debugging

## Objetivo

Fornecer uma **visão unificada do status de um SKU** em todas as etapas do tracking de produtos, desde o cadastro inicial até a disponibilidade para compra no site/loja física.

## Usuários

| Persona | Necessidade |
|---------|-------------|
| Analista GO | Ver onde um SKU específico está travado |
| Gerente de Categoria | Acompanhar % de SKUs ativos por categoria |
| TI / Suporte | Identificar falhas sistêmicas por etapa |

## Etapas do Tracking de Produtos

Ver detalhamento completo em [[sku-lifecycle]].

Cada etapa tem documentação dedicada com fonte de dados, campos e uso:

| #   | Etapa                                         | Doc                        |
| --- | --------------------------------------------- | -------------------------- |
| 1   | Cadastro Inicial — GO/Catálogo                | [[E01-cadastro-inicial]]   |
| 2   | Validação Fiscal — Tax Web (via API Catálogo) | [[E02-validacao-fiscal]]   |
| 3   | Proposta Comercial — LN (Infor)               | [[E03-proposta-comercial]] |
| 4   | Agendamento — LN / Neogrid                    | [[E04-agendamento]]        |
| 5   | Estoque — Banco Inventario (SQL)              | [[E05-estoque]]            |
| 6   | Produzido Site — Admin                        | [[E06-produzido]]          |
| 7   | Produzido Loja Física — Admin                 | [[E07-produzido-loja]]     |
| 8   | Ativação Pricing — GO / Admin                 | [[E08-ativacao-pricing]]   |
| 9   | Exibição Site/Loja Física — Corp / MONGOS     | [[E09-exibicao-site-loja]] |

## Critérios de Aceite

- [ ] É possível buscar um SKU e ver em qual etapa ele está
- [ ] Cada etapa mostra a origem do dado e quando foi atualizado
- [ ] SKUs travados em uma etapa são identificáveis em lote
- [ ] Os filtros de elegibilidade são aplicáveis (Produzido, Com Estoque, Ativos, Categoria)
- [ ] A lista de SKUs pode ser exportada

## Escopo

> **O tracking é exclusivo para produtos 1P (First Party).**
> Produtos 3P (marketplace) estão fora do escopo.

Ver: [[sku-on-off-1p-3p]]

## Fora do Escopo

- Produtos **3P** (marketplace) — estes têm fluxo próprio no ecossistema de parceiros
- Alteração de dados (o sistema é somente leitura / observabilidade)
- Gestão de cadastro de produtos (já existe no GO)
- Integração com Pricing (apenas leitura do status)

## Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | Qual é a origem dos dados de Agendamento? | A definir | ⚠️ Parcial — Juliana confirmou LN/Neogrid (09/04/2026). Alonso detalhou fluxo e fonte Databricks. Ver [[E04-agendamento]] |
| 2 | Qual a fonte de dados para o status de Pricing e Exibição? | Time Plataforma | 🟡 Flags SQL confirmadas por Douglas Souza Wolff (09/04/2026): `SkuLojista.FlagAtiva`, `SkuLojistaPreço.FlagAtiva` + flags de `Sku`, `Produto`, `Marca`, `Categoria` (4 níveis). Decisão API vs SQL direto em aberto. Ver [[regras-exibicao-sku]], [[E08-ativacao-pricing]], [[decisao-fonte-dados-tracking]] |
| 3 | Estoque físico x fingido — qual sistema é fonte de verdade? | A definir | 🟡 Parcial — banco relacional `Inventario.SaldoEstoqueRestricao` identificado como fonte consultável (`QuantidadeDisponivel > 0`). Tipos de estoque (físico vs. fingido) via `TipoEstoque` ainda a mapear. Ver [[regras-estoque-inventario]] e [[E05-estoque]] |
| 4 | Como detectar divergência entre SQL e MongoDB (MONGOS)? | Time Plataforma | 🟡 Regra definida — posicionada como **V2** (fora do MVP). Ver [[validacao-sincronizacao-sql-mongo]] |
